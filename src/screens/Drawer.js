import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import uniqueId from 'lodash/uniqueId';
import i18n from '../utils/i18n';

// Components
import Icon from '../components/Icon';

import theme from '../config/theme';
import config from '../config';
import * as authActions from '../actions/authActions';
import * as pagesActions from '../actions/pagesActions';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$drawerBgColor',
  },
  scroll: {
    flex: 1,
  },
  header: {
    backgroundColor: '$drawerHeaderBackgroundColor',
    position: 'relative',
    borderBottomWidth: 1,
    borderColor: '$drawerHeaderBorderColor'
  },
  headerUserName: {
    paddingTop: 10,
    paddingLeft: 22,
    paddingBottom: 14,
  },
  headerUserNameText: {
    color: '$drawerHeaderTextColor',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  headerUserMailText: {
    fontSize: '0.8rem',
    color: '$drawerHeaderTextColor',
  },
  logo: {
    resizeMode: 'contain',
    width: '100%',
    height: 100,
    marginTop: 20,
  },
  signInBtn: {
    backgroundColor: 'transparent',
  },
  signInDelim: {
    paddingLeft: 6,
    paddingRight: 6,
  },
  signInWrapper: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingLeft: 22,
    paddingBottom: 14,
  },
  signInBtnText: {
    textAlign: 'left',
    color: '$drawerHeaderTextColor',
    fontSize: '1rem',
  },
  itemBtn: {
    padding: 10,
    paddingLeft: 20,
  },
  mainMenu: {
    marginTop: 14,
  },
  itemBtnText: {
    fontSize: '0.9rem',
    paddingTop: 3,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  itemBtnWrapper: {
    flexDirection: 'row',
  },
  itemBtnIcon: {
    fontSize: 28,
    marginRight: 20,
    color: '$drawerHeaderButtonColor',
  },
  itemBadgeRed: {
    position: 'absolute',
    top: 1,
    right: 1,
    minWidth: 20,
    height: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$drawerPrimaryBadgeColor',
  },
  itemBadgeRedText: {
    color: '#fff',
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
  itemBadgeGray: {
    position: 'absolute',
    top: 1,
    right: 1,
    minWidth: 20,
    height: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$drawerSecondaryBadgeColor',
  },
  itemBadgeGrayText: {
    color: 'black',
  },
  signOutBtn: {
    position: 'absolute',
    right: 5,
    top: 0,
    backgroundColor: 'transparent',
    padding: 14,
  },
  signOutBtnIcon: {
    fontSize: 28,
    color: '$drawerHeaderButtonColor',
  },
  devider: {
    borderBottomWidth: 1,
    borderColor: '$drawerHeaderBackgroundColor',
    marginTop: 14,
    marginBottom: 14,
  },
  redColor: {
    color: '$primaryColor',
  }
});

class Drawer extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      resetTo: PropTypes.func,
      showModal: PropTypes.func,
      toggleDrawer: PropTypes.func,
      handleDeepLink: PropTypes.func,
    }),
    cart: PropTypes.shape({
      amount: PropTypes.number,
    }),
    wishList: PropTypes.shape({
      items: PropTypes.array,
    }),
    pages: PropTypes.shape({
      items: PropTypes.arrayOf(PropTypes.object),
    }),
    profile: PropTypes.shape({
      user_type: PropTypes.string,
    }),
    auth: PropTypes.shape({
      logged: PropTypes.bool,
    }),
    authActions: PropTypes.shape({
      logout: PropTypes.func,
    }),
    pagesActions: PropTypes.shape({
      fetch: PropTypes.func,
    }),
  };

  componentDidMount() {
    const { pagesActions } = this.props;
    pagesActions.fetch(config.layoutId);
  }

  handleOpenPage = (page) => {
    const { navigator } = this.props;
    navigator.handleDeepLink({
      link: `dispatch=pages.view&page_id=${page.page_id}`,
      payload: {
        title: page.page,
      },
    });
    this.closeDrawer();
  }

  closeDrawer() {
    const { navigator } = this.props;
    navigator.toggleDrawer({
      side: 'left',
    });
  }

  renderHeader() {
    const {
      cart,
      auth,
      authActions,
      navigator
    } = this.props;
    if (auth.logged) {
      return (
        <View style={styles.header}>
          {theme.$logoUrl !== '' ? (
            <Image
              source={{ uri: theme.$logoUrl }}
              style={styles.logo}
            />
          ) : <View style={{ height: 30 }} />}
          <View style={styles.headerUserName}>
            <Text style={styles.headerUserNameText} numberOfLines={2}>
              {cart.user_data.b_firstname} {cart.user_data.b_lastname}
            </Text>
            <Text style={styles.headerUserMailText}>
              {cart.user_data.email}
            </Text>
            <TouchableOpacity
              style={styles.signOutBtn}
              onPress={() => {
                authActions.logout();
                navigator.handleDeepLink({
                  link: 'home/',
                  payload: {},
                });
                this.closeDrawer();
              }}
            >
              <Icon name="exit-to-app" style={styles.signOutBtnIcon} />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.header}>
        {theme.$logoUrl !== '' ? (
          <Image
            source={{ uri: theme.$logoUrl }}
            style={styles.logo}
          />
        ) : <View style={{ height: 30 }} />}
        <View style={styles.signInWrapper}>
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => {
              this.closeDrawer();
              navigator.showModal({
                screen: 'Login',
              });
            }}
          >
            <Text style={styles.signInBtnText}>
              {i18n.gettext('Login')}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.signInBtnText, styles.signInDelim]}>
            {i18n.gettext('|')}
          </Text>

          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => {
              this.closeDrawer();
              navigator.showModal({
                screen: 'Registration',
                title: i18n.gettext('Registration'),
                passProps: {
                  showClose: true,
                },
              });
            }}
          >
            <Text style={styles.signInBtnText}>
              {i18n.gettext('Registration')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  renderItem = (text, onPress, badge = 0, type = 'red') => {
    const renderBadge = () => {
      if (badge === 0) {
        return null;
      }
      let badgeStyle = styles.itemBadgeRed;
      let badgeTextStyle = styles.itemBadgeRedText;
      if (type === 'gray') {
        badgeStyle = styles.itemBadgeGray;
        badgeTextStyle = styles.itemBadgeGrayText;
      }
      return (
        <View style={badgeStyle}>
          <Text style={badgeTextStyle}>
            {badge}
          </Text>
        </View>
      );
    };
    return (
      <TouchableOpacity
        style={styles.itemBtn}
        onPress={onPress}
        key={uniqueId()}
      >
        <View>
          <Text style={styles.itemBtnText}>
            {text}
          </Text>
          {renderBadge()}
        </View>
      </TouchableOpacity>
    );
  };

  renderBadge = (badge, type = null) => {
    if (badge === 0) {
      return null;
    }
    let badgeStyle = styles.itemBadgeRed;
    let badgeTextStyle = styles.itemBadgeRedText;
    if (type === 'gray') {
      badgeStyle = styles.itemBadgeGray;
      badgeTextStyle = styles.itemBadgeGrayText;
    }
    return (
      <View style={badgeStyle}>
        <Text style={badgeTextStyle}>
          {badge}
        </Text>
      </View>
    );
  }

  renderVendorMenu = () => {
    const { navigator, profile } = this.props;

    if (profile.user_type !== 'V') {
      return null;
    }

    return (
      <View>
        {/* {this.renderMenuItem('assessment', i18n.gettext('Dashboard'), () => {})} */}
        {this.renderMenuItem('archive', i18n.gettext('Vendor Orders'), () => {
          this.closeDrawer();
          navigator.handleDeepLink({
            link: 'vendor/orders/',
            payload: {},
          });
        })}
        {/* {this.renderMenuItem('forum', i18n.gettext('Vendor Message Center'), () => {})} */}
        {this.renderMenuItem('pages', i18n.gettext('Vendor Products'), () => {
          this.closeDrawer();
          navigator.handleDeepLink({
            link: 'vendor/products/',
            payload: {},
          });
        })}
        {this.renderMenuItem(
          'add-circle',
          i18n.gettext('Add product'),
          () => {
            this.closeDrawer();
            navigator.handleDeepLink({
              link: 'vendor/add_product/',
              payload: {},
            });
          },
          styles.redColor
        )}
        <View style={styles.devider} />
      </View>
    );
  };

  renderMenuItem = (icon, text, onPress, customStyle = {}) => {
    return (
      <TouchableOpacity
        style={styles.itemBtn}
        onPress={onPress}
      >
        <View style={styles.itemBtnWrapper}>
          <Icon name={icon} style={[styles.itemBtnIcon, customStyle]} />
          <Text style={[styles.itemBtnText, customStyle]}>
            {text}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    const {
      navigator,
      pages,
      auth,
      cart,
      wishList,
    } = this.props;
    const pagesList = pages.items
      .map(p => this.renderItem(p.page, () => this.handleOpenPage(p)));

    return (
      <View style={styles.container}>
        {this.renderHeader()}
        <ScrollView style={styles.scroll}>
          <View style={styles.mainMenu}>

            {auth.logged && this.renderVendorMenu()}

            {this.renderMenuItem('home', i18n.gettext('Home'), () => {
              navigator.handleDeepLink({
                link: 'home/',
                payload: {},
              });
              this.closeDrawer();
            })}

            <TouchableOpacity
              style={styles.itemBtn}
              onPress={() => {
                navigator.showModal({
                  screen: 'Cart',
                });
                this.closeDrawer();
              }}
            >
              <View style={styles.itemBtnWrapper}>
                <Icon name="shopping-cart" style={styles.itemBtnIcon} />
                <Text style={styles.itemBtnText}>
                  {i18n.gettext('Cart')}
                </Text>
                {this.renderBadge(cart.amount)}
              </View>
            </TouchableOpacity>

            {auth.logged && (
              <TouchableOpacity
                style={styles.itemBtn}
                onPress={() => {
                  navigator.showModal({
                    screen: 'WishList',
                  });
                  this.closeDrawer();
                }}
              >
                <View style={styles.itemBtnWrapper}>
                  <Icon name="favorite" style={styles.itemBtnIcon} />
                  <Text style={styles.itemBtnText}>
                    {i18n.gettext('Wish List')}
                  </Text>
                  {this.renderBadge(wishList.items.length)}
                </View>
              </TouchableOpacity>
            )}

            {auth.logged && (
              this.renderMenuItem('person', i18n.gettext('My Profile'), () => {
                navigator.showModal({
                  screen: 'Profile',
                  title: i18n.gettext('Profile'),
                  passProps: {},
                });
                this.closeDrawer();
              })
            )}

            {auth.logged && (
              this.renderMenuItem('receipt', i18n.gettext('Orders'), () => {
                navigator.handleDeepLink({
                  link: 'dispatch=orders.search',
                  payload: {},
                });
                this.closeDrawer();
              })
            )}
          </View>
          <View style={styles.devider} />
          <View style={styles.pagesMenu}>
            {pagesList}
          </View>
        </ScrollView>
      </View>
    );
  }
}

export default connect(
  state => ({
    auth: state.auth,
    cart: state.cart,
    wishList: state.wishList,
    pages: state.pages,
    profile: state.profile,
  }),
  dispatch => ({
    authActions: bindActionCreators(authActions, dispatch),
    pagesActions: bindActionCreators(pagesActions, dispatch),
  })
)(Drawer);
