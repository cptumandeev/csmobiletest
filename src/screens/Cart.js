import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  View,
  Text,
  Alert,
  Image,
  FlatList,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Swipeout from 'react-native-swipeout';
import debounce from 'lodash/debounce';

// Import actions.
import * as cartActions from '../actions/cartActions';

// Components
import Icon from '../components/Icon';
import Spinner from '../components/Spinner';
import QtyOption from '../components/QtyOption';
import CartFooter from '../components/CartFooter';

// theme
import theme from '../config/theme';

// links
import { registerDrawerDeepLinks } from '../utils/deepLinks';
import i18n from '../utils/i18n';
import { formatPrice, getImagePath } from '../utils';

import {
  iconsMap,
  iconsLoaded,
} from '../utils/navIcons';

// Styles
const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  topBtn: {
    padding: 10,
  },
  trashIcon: {
    height: 20,
    fontSize: 20,
  },
  productItemWrapper: {
    marginBottom: 15,
  },
  productItem: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F1F1F1',
    flexDirection: 'row',
    paddingBottom: 10,
    padding: 14,
    width: '100%',
    overflow: 'hidden',
  },
  productItemImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  productItemDetail: {
    marginLeft: 14,
    marginRight: 14,
    width: '70%',
  },
  productItemName: {
    fontSize: '0.9rem',
    color: 'black',
    marginBottom: 5,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  productItemPrice: {
    fontSize: '0.7rem',
    color: 'black',
    textAlign: 'left',
  },
  emptyListContainer: {
    marginTop: '3rem',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyListIconWrapper: {
    backgroundColor: '#3FC9F6',
    width: '12rem',
    height: '12rem',
    borderRadius: '6rem',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListIcon: {
    backgroundColor: 'transparent',
    color: '#fff',
    fontSize: '6rem',
  },
  emptyListHeader: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: 'black',
    marginTop: '1rem',
  },
  emptyListDesc: {
    fontSize: '1rem',
    color: '#24282b',
    marginTop: '0.5rem',
  },
  qtyContainer: {
    position: 'absolute',
    right: 14,
    bottom: 0,
  },
});

class Cart extends Component {
  static navigatorStyle = {
    navBarBackgroundColor: theme.$navBarBackgroundColor,
    navBarButtonColor: theme.$navBarButtonColor,
    navBarButtonFontSize: theme.$navBarButtonFontSize,
    navBarTextColor: theme.$navBarTextColor,
    screenBackgroundColor: theme.$screenBackgroundColor,
  };

  static propTypes = {
    navigator: PropTypes.shape({
      push: PropTypes.func,
      dismissModal: PropTypes.func,
      setOnNavigatorEvent: PropTypes.func,
    }),
    cartActions: PropTypes.shape({
      fetch: PropTypes.func,
      clear: PropTypes.func,
      remove: PropTypes.func,
      change: PropTypes.func,
      changeAmount: PropTypes.func,
    }),
    auth: PropTypes.shape({
      token: PropTypes.string,
    }),
    cart: PropTypes.shape({}),
  };

  constructor(props) {
    super(props);

    this.state = {
      products: [],
      fetching: true,
      refreshing: false,
    };
    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.handleChangeAmountRequest = debounce(this.handleChangeAmountRequest, 2000);
  }

  componentWillMount() {
    const { navigator } = this.props;
    iconsLoaded.then(() => {
      navigator.setButtons({
        leftButtons: [
          {
            id: 'close',
            icon: iconsMap.close,
          },
        ],
        rightButtons: [
          {
            id: 'clearCart',
            icon: iconsMap.delete,
          },
        ],
      });
    });

    navigator.setTitle({
      title: i18n.gettext('Cart').toUpperCase(),
    });
  }

  componentDidMount() {
    const { cartActions } = this.props;
    cartActions.fetch();
  }

  componentWillReceiveProps(nextProps) {
    const { cart } = nextProps;
    if (cart.fetching) {
      return;
    }

    const products = Object.keys(cart.products).map((key) => {
      const result = cart.products[key];
      result.cartId = key;
      return result;
    });

    this.setState({
      products,
      fetching: false,
      refreshing: false,
    });
  }

  onNavigatorEvent(event) {
    const { navigator, cartActions } = this.props;
    // handle a deep link
    registerDrawerDeepLinks(event, navigator);
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'close') {
        navigator.dismissModal();
      } else if (event.id === 'clearCart') {
        Alert.alert(
          i18n.gettext('Clear all cart ?'),
          '',
          [
            {
              text: i18n.gettext('Cancel'),
              onPress: () => {},
              style: 'cancel'
            },
            {
              text: i18n.gettext('Ok'),
              onPress: () => cartActions.clear(),
            },
          ],
          { cancelable: true }
        );
      }
    }
  }

  handleRemoveProduct = (product) => {
    const { cartActions } = this.props;
    cartActions.remove(product.cartId);
  };

  handleChangeAmountRequest(item) {
    const { cartActions } = this.props;
    cartActions.change(item.cartId, item);
  }

  renderProductItem = (item) => {
    const { cartActions } = this.props;
    let productImage = null;
    const imageUri = getImagePath(item);
    if (imageUri) {
      productImage = (
        <Image
          source={{ uri: imageUri }}
          style={styles.productItemImage}
        />);
    }

    const swipeoutBtns = [
      {
        text: i18n.gettext('Delete'),
        type: 'delete',
        onPress: () => this.handleRemoveProduct(item),
      },
    ];

    const step = parseInt(item.qty_step, 10) || 1;
    const max = parseInt(item.max_qty, 10) || parseInt(item.in_stock, 10);
    const min = parseInt(item.min_qty, 10) || step;
    const initialValue = parseInt(item.amount, 10);

    return (
      <View style={styles.productItemWrapper}>
        <Swipeout
          autoClose
          right={swipeoutBtns}
          backgroundColor={theme.$navBarBackgroundColor}
        >
          <View style={styles.productItem}>
            {productImage}
            <View style={styles.productItemDetail}>
              <Text
                style={styles.productItemName}
                numberOfLines={1}
              >
                {item.product}
              </Text>
              <Text style={styles.productItemPrice}>
                {item.amount} x {item.price_formatted.price}
              </Text>
            </View>
            <View style={styles.qtyContainer}>
              <QtyOption
                max={max}
                min={min}
                initialValue={initialValue}
                step={step}
                onChange={(val) => {
                  if (val <= parseInt(item.in_stock, 10)) {
                    cartActions.changeAmount(item.cartId, val);
                    this.handleChangeAmountRequest(item);
                  }
                }}
              />
            </View>
          </View>
        </Swipeout>
      </View>
    );
  }

  handleRefresh() {
    const { cartActions } = this.props;
    this.setState(
      { refreshing: true },
      () => cartActions.fetch(),
    );
  }

  handlePlaceOrder() {
    const { auth, navigator } = this.props;
    const products = {};
    this.state.products.forEach((p) => {
      products[p.product_id] = {
        product_id: p.product_id,
        amount: p.amount,
      };
    });
    if (!auth.logged) {
      navigator.push({
        screen: 'CheckoutAuth',
        backButtonTitle: '',
        passProps: {
          products,
        },
      });
    } else {
      navigator.push({
        screen: 'CheckoutDelivery',
        backButtonTitle: '',
        passProps: {
          products,
        },
      });
    }
  }

  renderPlaceOrder() {
    const { cart } = this.props;
    const { products } = this.state;
    if (!products.length) {
      return null;
    }
    return (
      <CartFooter
        totalPrice={formatPrice(cart.subtotal_formatted.price)}
        btnText={i18n.gettext('Checkout').toUpperCase()}
        onBtnPress={() => this.handlePlaceOrder()}
      />
    );
  }

  renderEmptyList = () => {
    const { fetching } = this.state;
    if (fetching) {
      return null;
    }
    return (
      <View style={styles.emptyListContainer}>
        <View style={styles.emptyListIconWrapper}>
          <Icon name="add-shopping-cart" style={styles.emptyListIcon} />
        </View>
        <Text style={styles.emptyListHeader}>
          {i18n.gettext('Your shopping cart is empty.')}
        </Text>
        <Text style={styles.emptyListDesc}>
          {i18n.gettext('Looking for ideas?')}
        </Text>
      </View>
    );
  };

  renderList() {
    const { products, fetching, refreshing } = this.state;

    if (fetching) {
      return null;
    }

    return (
      <View style={styles.container}>
        <FlatList
          data={products}
          keyExtractor={(item, index) => `${index}`}
          renderItem={({ item }) => this.renderProductItem(item)}
          onRefresh={() => this.handleRefresh()}
          refreshing={refreshing}
          ListEmptyComponent={() => this.renderEmptyList()}
        />
        {this.renderPlaceOrder()}
      </View>
    );
  }

  renderSpinner = () => {
    const { refreshing } = this.state;
    const { cart } = this.props;

    if (refreshing) {
      return false;
    }

    return (
      <Spinner visible={cart.fetching} mode="content" />
    );
  };

  render() {
    return (
      <View style={styles.container}>
        {this.renderList()}
        {this.renderSpinner()}
      </View>
    );
  }
}

export default connect(
  state => ({
    auth: state.auth,
    cart: state.cart,
  }),
  dispatch => ({
    cartActions: bindActionCreators(cartActions, dispatch),
  })
)(Cart);
