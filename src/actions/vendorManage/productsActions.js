import {
  VENDOR_FETCH_PRODUCTS_REQUEST,
  VENDOR_FETCH_PRODUCTS_FAIL,
  VENDOR_FETCH_PRODUCTS_SUCCESS,

  VENDOR_FETCH_PRODUCT_REQUEST,
  VENDOR_FETCH_PRODUCT_FAIL,
  VENDOR_FETCH_PRODUCT_SUCCESS,

  VENDOR_DELETE_PRODUCT_REQUEST,
  VENDOR_DELETE_PRODUCT_FAIL,
  VENDOR_DELETE_PRODUCT_SUCCESS,

  VENDOR_UPDATE_PRODUCT_REQUEST,
  VENDOR_UPDATE_PRODUCT_FAIL,
  VENDOR_UPDATE_PRODUCT_SUCCESS,

  VENDOR_CREATE_PRODUCT_REQUEST,
  VENDOR_CREATE_PRODUCT_FAIL,
  VENDOR_CREATE_PRODUCT_SUCCESS,

  VENDOR_PRODUCT_CHANGE_CATEGORY,

  NOTIFICATION_SHOW,
} from '../../constants';
import * as vendorService from '../../services/vendors';
import i18n from '../../utils/i18n';

export function fetchProducts(page = 0) {
  return async (dispatch) => {
    dispatch({
      type: VENDOR_FETCH_PRODUCTS_REQUEST,
      payload: page,
    });
    const nextPage = page + 1;

    try {
      const result = await vendorService.getProductsList(nextPage);
      dispatch({
        type: VENDOR_FETCH_PRODUCTS_SUCCESS,
        payload: {
          items: result.data.products,
          page: nextPage,
          hasMore: result.data.products.length !== 0,
        },
      });
    } catch (error) {
      dispatch({
        type: VENDOR_FETCH_PRODUCTS_FAIL,
        error,
      });
    }
  };
}

export function fetchProduct(id = 0, loading = true) {
  return async (dispatch) => {
    dispatch({
      type: VENDOR_FETCH_PRODUCT_REQUEST,
      payload: loading
    });

    try {
      const result = await vendorService.getProductDetail(id);
      dispatch({
        type: VENDOR_FETCH_PRODUCT_SUCCESS,
        payload: result.data.product,
      });
    } catch (error) {
      dispatch({
        type: VENDOR_FETCH_PRODUCT_FAIL,
        error,
      });
    }
  };
}

export function deleteProduct(id = null) {
  return async (dispatch) => {
    dispatch({
      type: VENDOR_DELETE_PRODUCT_REQUEST,
    });

    try {
      await vendorService.deleteProduct(id);
      dispatch({
        type: VENDOR_DELETE_PRODUCT_SUCCESS,
        payload: id,
      });
      dispatch({
        type: NOTIFICATION_SHOW,
        payload: {
          type: 'success',
          title: i18n.gettext('Success'),
          text: i18n.gettext('The product was deleted.'),
          closeLastModal: false,
        },
      });
    } catch (error) {
      dispatch({
        type: VENDOR_DELETE_PRODUCT_FAIL,
        error,
      });
    }
  };
}

export function updateProduct(id = null, product = {}) {
  return async (dispatch) => {
    dispatch({
      type: VENDOR_UPDATE_PRODUCT_REQUEST,
      payload: {
        id,
        product
      },
    });

    try {
      await vendorService.updateProduct(id, product);
      dispatch({
        type: VENDOR_UPDATE_PRODUCT_SUCCESS,
        payload: {
          id,
          product
        },
      });
      dispatch({
        type: NOTIFICATION_SHOW,
        payload: {
          type: 'success',
          title: i18n.gettext('Success'),
          text: i18n.gettext('The product was updated.'),
          closeLastModal: false,
        },
      });
    } catch (error) {
      dispatch({
        type: VENDOR_UPDATE_PRODUCT_FAIL,
        error,
      });
    }
  };
}

export function createProduct(product) {
  return async (dispatch) => {
    dispatch({
      type: VENDOR_CREATE_PRODUCT_REQUEST,
    });

    try {
      const result = await vendorService.createProduct(product);

      if (result.errors && result.errors.length) {
        dispatch({
          type: NOTIFICATION_SHOW,
          payload: {
            type: 'info',
            title: i18n.gettext('Error'),
            text: i18n.gettext(result.errors.join('\n')),
            closeLastModal: false,
          },
        });
        return null;
      }

      dispatch({
        type: NOTIFICATION_SHOW,
        payload: {
          type: 'success',
          title: i18n.gettext('Success'),
          text: i18n.gettext('The product was created.'),
          closeLastModal: false,
        },
      });

      dispatch({
        type: VENDOR_CREATE_PRODUCT_SUCCESS,
        payload: result,
      });

      return result.data.create_product;
    } catch (error) {
      dispatch({
        type: VENDOR_CREATE_PRODUCT_FAIL,
        error,
      });
    }

    return null;
  };
}


export function changeProductCategory(categories) {
  return (dispatch) => {
    dispatch({
      type: VENDOR_PRODUCT_CHANGE_CATEGORY,
      payload: [categories],
    });
  };
}
