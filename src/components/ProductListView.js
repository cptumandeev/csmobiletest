import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import toInteger from 'lodash/toInteger';
import get from 'lodash/get';
import EStyleSheet from 'react-native-extended-stylesheet';
import { PRODUCT_IMAGE_WIDTH, formatPrice, getImagePath } from '../utils';
import i18n from '../utils/i18n';

const styles = EStyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '$productBorderColor',
    backgroundColor: '#fff',
    padding: 15,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 240,
    flex: 2,
    maxWidth: '50%',
  },
  productImage: {
    width: PRODUCT_IMAGE_WIDTH,
    height: PRODUCT_IMAGE_WIDTH,
  },
  description: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  productName: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  productPrice: {
    color: '#73626B',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  listDiscountWrapper: {
    backgroundColor: '$productDiscountColor',
    position: 'absolute',
    top: 4,
    right: 4,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 4,
    paddingRight: 4,
    borderRadius: 2,
  },
  priceWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  listPriceText: {
    textDecorationLine: 'line-through',
    color: '$darkColor',
    textAlign: 'left',
    paddingRight: 4,
    paddingTop: 2,
    fontSize: 12,
  },
  listDiscountText: {
    color: '#fff',
    textAlign: 'left',
  },
});

class ProductListView extends PureComponent {
  static propTypes = {
    product: PropTypes.shape({
      item: PropTypes.object,
    }),
    onPress: PropTypes.func,
  };

  renderDiscount = () => {
    const { product } = this.props;
    const { item } = product;

    if (!item.list_discount_prc && !item.discount_prc) {
      return null;
    }

    const discount = item.list_discount_prc || item.discount_prc;

    return (
      <View style={styles.listDiscountWrapper}>
        <Text style={styles.listDiscountText}>
          {i18n.gettext('Discount')} {`${discount}%`}
        </Text>
      </View>
    );
  }

  renderPrice = () => {
    const { product } = this.props;
    const { item } = product;
    const productTaxedPrice = get(item, 'taxed_price_formatted.price', '');
    const productPrice = productTaxedPrice || get(item, 'price_formatted.price', product.price);
    let discountPrice = null;

    if (toInteger(item.discount_prc)) {
      discountPrice = item.base_price_formatted.price;
    } else if (toInteger(item.list_price)) {
      discountPrice = item.list_price_formatted.price;
    }

    const isProductPriceZero = Math.ceil(item.price) === 0;
    const showDiscount = isProductPriceZero && (item.discount_prc || item.list_discount_prc);

    return (
      <View style={styles.priceWrapper}>
        {
          showDiscount && (
            <Text style={styles.listPriceText}>
              {discountPrice}
            </Text>
          )
        }
        {isProductPriceZero ? <Text>{i18n.gettext('Contact us for a price')}</Text> : (
          <Text
            numberOfLines={1}
            style={styles.productPrice}
          >
            {formatPrice(productPrice)}
          </Text>
        )}
      </View>
    );
  }

  render() {
    const { product, onPress } = this.props;
    const { item } = product;
    const imageUri = getImagePath(item);

    return (
      <TouchableOpacity
        style={styles.container}
        onPress={() => onPress(item)}
      >
        <View>
          {imageUri !== null && (
            <Image
              style={styles.productImage}
              source={{ uri: imageUri }}
              resizeMode="contain"
              resizeMethod="resize"
            />
          )}
        </View>
        {this.renderDiscount()}
        <View style={styles.description}>
          <Text
            numberOfLines={1}
            style={styles.productName}
          >
            {item.product}
          </Text>
          {this.renderPrice()}
        </View>
      </TouchableOpacity>
    );
  }
}

export default ProductListView;
