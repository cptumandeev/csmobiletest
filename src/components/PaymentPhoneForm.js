import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, I18nManager } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import * as t from 'tcomb-form-native';

import i18n from '../utils/i18n';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 14,
  },
});

const Form = t.form.Form;
const formFields = t.struct({
  phone: t.String,
  notes: t.maybe(t.String),
});
const formOptions = {
  disableOrder: true,
  fields: {
    phone: {
      label: i18n.gettext('Phone'),
      clearButtonMode: 'while-editing',
      returnKeyType: 'done',
      keyboardType: 'phone-pad',
    },
    notes: {
      label: i18n.gettext('Comment'),
      i18n: {
        optional: '',
        required: '',
      },
      help: `${i18n.gettext('(Optional)')}`,
      clearButtonMode: 'while-editing',
      returnKeyType: 'done',
      multiline: true,
      blurOnSubmit: true,
      stylesheet: {
        ...Form.stylesheet,
        controlLabel: {
          ...Form.stylesheet.controlLabel,
          normal: {
            ...Form.stylesheet.controlLabel.normal,
            textAlign: 'left',
          },
          error: {
            ...Form.stylesheet.controlLabel.error,
            textAlign: 'left',
          },
        },
        textbox: {
          ...Form.stylesheet.textbox,
          normal: {
            ...Form.stylesheet.textbox.normal,
            height: 150,
            textAlign: I18nManager.isRTL ? 'right' : 'left',
            writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
          },
          error: {
            ...Form.stylesheet.textbox.error,
            textAlign: I18nManager.isRTL ? 'right' : 'left',
            writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
          }
        }
      },
    },
  }
};

export default class PaymentPhoneForm extends Component {
  static propTypes = {
    onInit: PropTypes.func,
    value: PropTypes.shape({}),
  };

  componentDidMount() {
    this.props.onInit(this.refs.form);
  }

  render() {
    return (
      <View style={styles.container}>
        <Form
          ref="form"
          type={formFields}
          options={formOptions}
          value={this.props.value}
        />
      </View>
    );
  }
}
