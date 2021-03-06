import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as t from 'tcomb-form-native';
import format from 'date-fns/format';

// Components
import i18n from '../utils/i18n';
import CartFooter from './CartFooter';
import FormBlock from './FormBlock';

const FIELD_DATE = 'D';
const FIELD_CHECKBOX = 'C';
const FIELD_SELECTBOX = 'S';
const FIELD_RADIO = 'R';
const FIELD_PASSWORD = 'W';
const FIELD_INPUT = 'I';
const FIELD_COUNTRY = 'O';
const FIELD_STATE = 'A';

const styles = EStyleSheet.create({
  contentContainer: {
    padding: 0,
    paddingBottom: 12,
  },
  form: {
    padding: 12,
    marginBottom: -30,
  },
  btn: {
    backgroundColor: '#4fbe31',
    padding: 12,
    borderRadius: 3,
  },
  btnText: {
    color: '#fff',
    fontSize: '1rem',
    textAlign: 'center',
  },
  header: {
    fontSize: '1.2rem',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'left'
  },
});

const { Form } = t.form;

export default class ProfileForm extends Component {
  static propTypes = {
    fields: PropTypes.shape().isRequired,
    onSubmit: PropTypes.func.isRequired,
    isEdit: PropTypes.bool,
    showTitles: PropTypes.bool,
  };

  static defaultProps = {
    isEdit: false,
    showTitles: false
  };

  constructor(props) {
    super(props);
    this.formsRef = {};
    this.state = {
      forms: [],
    };
  }

  componentDidMount() {
    const { fields } = this.props;
    const forms = [];

    function sortFunc(a, b) {
      const sortingArr = ['E', 'C', 'B', 'S'];
      return sortingArr.indexOf(a[1]) - sortingArr.indexOf(b[1]);
    }

    Object.keys(fields)
      .sort(sortFunc)
      .forEach((key) => {
        forms.push({
          type: key,
          description: fields[key].description,
          ...this.convertFieldsToTcomb(fields[key].fields),
        });
      });
    this.setState({
      forms,
    });
  }

  getFieldType = (field, allFields) => {
    const label = field.description || '';
    const help = !field.required ? `${i18n.gettext('(Optional)')}` : '';
    const optionI18n = {
      i18n: {
        optional: '',
        required: '',
      }
    };

    if (field.field_type === FIELD_DATE) {
      // Date field
      return {
        type: field.required ? t.Date : t.maybe(t.Date),
        options: {
          ...optionI18n,
          label,
          help,
          defaultValueText: i18n.gettext('Select date'),
          mode: 'date',
          config: {
            format: date => format(date, 'MM/DD/YYYY'),
          },
        },
      };
    }

    if (field.field_type === FIELD_CHECKBOX) {
      // Checkbox field
      return {
        type: field.required ? t.Boolean : t.maybe(t.Boolean),
        options: {
          ...optionI18n,
          label,
          help,
        },
      };
    }

    if (field.field_type === FIELD_SELECTBOX || field.field_type === FIELD_RADIO) {
      // Selectbox
      const values = Array.isArray(field.values) ? {} : field.values;
      const Enums = t.enums(values);
      return {
        type: field.required ? Enums : t.maybe(Enums),
        options: {
          ...optionI18n,
          label,
          help,
        },
      };
    }

    if (field.field_type === FIELD_PASSWORD) {
      // Password field
      return {
        type: field.required ? t.String : t.maybe(t.String),
        options: {
          ...optionI18n,
          label,
          help,
          secureTextEntry: true,
          clearButtonMode: 'while-editing',
        },
      };
    }

    if (field.field_type === FIELD_INPUT) {
      // Text field
      return {
        type: field.required ? t.String : t.maybe(t.String),
        options: {
          ...optionI18n,
          label,
          help,
          clearButtonMode: 'while-editing',
        },
      };
    }

    if (field.field_type === FIELD_COUNTRY) {
      // Country field
      return {
        type: field.required ? t.enums(field.values) : t.maybe(t.enums(field.values)),
        options: {
          ...optionI18n,
          label,
          help,
          defaultValueText: i18n.gettext('Select country'),
          nullOption: {
            value: '',
            text: i18n.gettext('Select country')
          },
        },
      };
    }

    if (field.field_type === FIELD_STATE) {
      // State field
      let countryCode = null;
      let values = null;

      const foundShippingCountry = allFields
        .filter(item => item.field_id === 's_country');
      if (foundShippingCountry.length) {
        countryCode = foundShippingCountry[0].value;
      }

      const foundBillingCountry = allFields
        .filter(item => item.field_id === 'b_country');
      if (foundBillingCountry.length) {
        countryCode = foundBillingCountry[0].value;
      }

      if (countryCode in field.values) {
        values = field.values[countryCode];
      }

      let type = field.required ? t.String : t.maybe(t.String);
      if (values) {
        type = field.required ? t.enums(values) : t.maybe(t.enums(values));
      }

      return {
        type,
        options: {
          ...optionI18n,
          label,
          help,
          defaultValueText: i18n.gettext('Select state'),
          nullOption: {
            value: '',
            text: i18n.gettext('Select state')
          },
        },
      };
    }

    return {
      type: field.required ? t.String : t.maybe(t.String),
      options: {
        ...optionI18n,
        label,
        help,
        clearButtonMode: 'while-editing',
      },
    };
  };

  convertFieldsToTcomb = (fields) => {
    const formValues = {};
    const formFields = {};
    const formOptions = {
      fields: {},
      order: fields.map(field => field.field_id),
    };

    let countryCache = null;
    let stateCache = null;

    fields.forEach((item) => {
      const itemData = this.getFieldType(item, fields);
      formFields[item.field_id] = itemData.type;
      formOptions.fields[item.field_id] = itemData.options;
      formValues[item.field_id] = item.value;

      if (item.field_type === FIELD_DATE) { // Date field
        formValues[item.field_id] = item.value ? new Date(item.value * 1000) : undefined;
      }

      if (item.field_type === FIELD_STATE) {
        stateCache = item;
      }

      if (item.field_type === FIELD_COUNTRY) {
        countryCache = item;
      }
    });

    // TODO: Fixme brainfuck code.
    // Reset state.
    if (countryCache && stateCache) {
      if (stateCache.values[countryCache.value]) {
        if (!stateCache.values[countryCache.value]) {
          formValues[stateCache.field_id] = '';
        }
      }
    }

    return {
      fields,
      formFields: t.struct(formFields),
      formOptions,
      formValues,
    };
  }

  handleValidate = () => {
    const { onSubmit } = this.props;
    let formsValues = {};
    let isFormsValid = true;

    Object.keys(this.formsRef)
      .forEach((key) => {
        const form = this.formsRef[key];
        const values = form.getValue();
        if (!values) {
          isFormsValid = false;
          return;
        }
        formsValues = {
          ...formsValues,
          ...values,
        };
      });

    if (isFormsValid) {
      onSubmit(formsValues);
    }
  }

  handleChange(values, index) {
    const { forms } = this.state;
    const newForms = [...forms];
    const fields = [];
    const newFormValues = { ...values };

    Object.keys(newForms[index].formValues)
      .forEach((key) => {
        if (key === 's_country') {
          const item = newForms[index].formValues[key];
          if (item !== values.s_country) {
            newFormValues.s_state = '';
          }
        }
        if (key === 'b_country') {
          const item = newForms[index].formValues[key];
          if (item !== values.b_country) {
            newFormValues.b_state = '';
          }
        }
      });
    newForms[index].formValues = newFormValues;

    Object.keys(newForms[index].fields)
      .forEach((key) => {
        const item = newForms[index].fields[key];
        fields[key] = item;
        fields[key].value = values[fields[key].field_id];
      });

    newForms[index].formFields = this.convertFieldsToTcomb(fields).formFields;
    this.setState({
      forms: newForms,
    });
  }

  render() {
    const { forms } = this.state;
    const { isEdit, showTitles } = this.props;

    return (
      <Fragment>
        <KeyboardAwareScrollView contentContainerStyle={styles.contentContainer}>
          {forms.map((form, index) => (
            <View key={form.type} style={styles.form}>
              <FormBlock
                title={(isEdit || showTitles) ? form.description : null}
              >
                <Form
                  ref={(ref) => { this.formsRef[form.type] = ref; }}
                  type={form.formFields}
                  options={form.formOptions}
                  value={form.formValues}
                  onChange={values => this.handleChange(values, index)}
                />
              </FormBlock>
            </View>
          ))}
        </KeyboardAwareScrollView>
        {
          this.props.cartFooterEnabled
            ? (
              <CartFooter
                totalPrice={this.props.totalPrice}
                btnText={this.props.btnText}
                onBtnPress={() => { this.props.onBtnPress(forms, this.handleValidate); }}
              />
            )
            : (
              <TouchableOpacity
                style={styles.btn}
                onPress={this.handleValidate}
              >
                <Text style={styles.btnText}>
                  {isEdit ? i18n.gettext('Save') : i18n.gettext('Register')}
                </Text>
              </TouchableOpacity>
            )
        }
      </Fragment>
    );
  }
}
