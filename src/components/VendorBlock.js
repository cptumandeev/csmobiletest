import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import get from 'lodash/get';
import uniqueId from 'lodash/uniqueId';

import Rating from './Rating';

const styles = EStyleSheet.create({
  container: {
    marginTop: 5,
    marginBottom: 20,
    width: '100%',
  },
  img: {
    width: 140,
    height: 60,
    marginLeft: 14,
    marginRight: 14,
    resizeMode: 'contain',
  },
  content: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F1F1',
    paddingBottom: 20,
    paddingTop: 20,
  },
  item: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontWeight: 'bold',
    fontSize: '1.3rem',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
    color: '$categoriesHeaderColor',
    textAlign: 'left'
  }
});

export default class VendorBlock extends Component {
  static propTypes = {
    name: PropTypes.string,
    wrapper: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({})),
    onPress: PropTypes.func,
  }

  static defaultProps = {
    items: [],
  }

  renderImage = (item, index) => {
    const imageUri = get(item, 'logos.theme.image.http_image_path');
    return (
      <TouchableOpacity
        key={index}
        onPress={() => this.props.onPress(item)}
        style={styles.item}
      >
        <Image source={{ uri: imageUri }} style={styles.img} />
        <Rating value={item.average_rating} />
      </TouchableOpacity>
    );
  }

  render() {
    const { items, name, wrapper } = this.props;
    return (
      <View style={styles.container}>
        {wrapper !== '' && <Text style={styles.header}>{name}</Text>}
        <FlatList
          style={styles.content}
          horizontal
          data={items}
          keyExtractor={(item, index) => uniqueId(`company_${index}`)}
          renderItem={({ item, index }) => this.renderImage(item, index)}
        />
      </View>
    );
  }
}
