import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Box,
  Typography
} from "@mui/material";
// import { Box } from "@mui/system";
import axios from "axios";

import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Cart, { generateCartItemsFrom } from "./Cart";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import "./Products.css";



const Products = () => {
  const { enqueueSnackbar } = useSnackbar()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [debounceTimeout, setDebounceTimeout] = useState(0)
  const [fetchedCart, setFetchedCart] = useState([])
  const [cartList, setCartList] = useState([])

  const performAPICall = async () => {
    try {
      const url = `${config.endpoint}/products`
      const response = await axios.get(url)
      const data = response.data
      setIsLoading(false)
      //setProducts(data)
      return data
    } catch (error) {
      setIsLoading(false)
      setProducts([])
      enqueueSnackbar(error.response.data.message, { variant: "error" });
    }
  }

  const performSearch = async (text) => {
    let erres = null;
    try {
      const url = config.endpoint + `/products/search?value=${text}`;
      const response = await axios.get(url);

      if (response) {
        return response.data;
      }
    } catch (error) {
      if (error.response) {
        erres = error.response;
      } else {
        console.log(error);
      }
    }
    if (erres)
      return erres.data;
  };



  // const performSearch = async (text) => {
  //   try {
  //     const response = await axios.get(
  //       `${config.endpoint}/products/search?value=${text}`
  //     );
  //     if (response.data) {
  //       setError(false)
  //       setProducts(response.data);
  //       return response.data;
  //     }
  //   } catch (e) {
  //     if (e.response.status === 404) {
  //       setError(true)
  //       setProducts([]);


  //     }
  //   }
  // };



  // const debounceSearch = (event, debounceTimeout) => {
  //   performSearch(event)
  //   if (debounceTimeout !== 0) {
  //     clearTimeout(debounceTimeout);
  //   }
  //   let timerId = setTimeout(() => performSearch(event.target.value), 500);
  //   setDebounceTimeout(timerId);
  // }

  const debounceSearch = (event, debounceTimeout) => {
    if (debounceTimeout !== 0) {
      clearTimeout(debounceTimeout);
    }
    const timeout = setTimeout(async () => {
      setProducts(await performSearch(event.target.value));
    }, 500);
    setDebounceTimeout(timeout);
  };


  const fetchCart = async (token) => {
    if (!token) return;

    try {

      const response = await axios.get(config.endpoint + "/cart", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = response.data

      //console.log(data);

      return data
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };




  useEffect(() => {
    // code to run after render goes here
    const callApi = async () => {
      setIsLoading(true)
      const getProducts = await performAPICall();
      setIsLoading(false)
      setProducts(getProducts);
      // if (localStorage.getItem('username')) {
      //   const getCart = await fetchCart(localStorage.getItem("token"))
      //   setFetchedCart(getCart)
      //   setCartList(generateCartItemsFrom(getCart, getProducts))
      // }
      const getCart = await fetchCart(localStorage.getItem("token"))
      setFetchedCart(getCart)
      setCartList(generateCartItemsFrom(getCart, getProducts))
      // console.log("inside useeffect",fetchedcart,res)
    };
    callApi();
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    const prodIds = items.map((item) => {
      return item.productId;
    })
    return (prodIds.includes(productId));
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    try {
      // console.log(token,items,products,productId,qty,options)
      if (!token) {
        enqueueSnackbar("Login to add an item to the Cart", {
          variant: "warning",
        });
      } else if (options.preventDuplicate && isItemInCart(items, productId)) {
        enqueueSnackbar(
          "Item already in cart. Use the cart sidebar to update quantity or remove item.",
          { variant: "warning" }
        );
      } else {
        //console.log(token,items,products,productId,qty,options)
        const res = await axios.post(
          `${config.endpoint}/cart`,
          { productId: productId, qty: qty },
          {
            headers: { Authorization: "Bearer " + token }
          }
        );

        setFetchedCart(res.data);
        setCartList(generateCartItemsFrom(res.data, products));

      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        enqueueSnackbar(error.response.data.message, { variant: "error" });
      }
    }
  };






  return (
    <div>
      <Header

        children={
          (<div className="search">
            <TextField
              className="search-desktop"
              fullWidth
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Search color="primary" />
                  </InputAdornment>
                ),
              }}
              placeholder="Search for items/categories"
              name="search"
              //value={search}
              onChange={(e) => {
                debounceSearch(e, debounceTimeout);
              }}
            />
          </div>)
        }

        hasHiddenAuthButtons={false}>

      </Header>
      <TextField
        className="search-mobile"
        fullWidth
        size="small"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        //value={search}
        onChange={(e) => {
          debounceSearch(e, debounceTimeout);
        }}
      />
      <Grid container>
        <Grid item md={localStorage.getItem("username") ? 9 : 12} xs={12}>
          <Box>
            <Grid container>
              <Grid item className="product-grid">
                <Box className="hero">
                  <p className="hero-heading">
                    India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
                    to your door step
                  </p>
                </Box>
              </Grid>
            </Grid>

            {
              isLoading ?
                <div className="loading">
                  <CircularProgress />
                  <Typography variant="p" sx={{ marginTop: "1rem" }}>Loading Products</Typography>
                </div> :
                (products.length === 0 ?
                  <Grid container sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                    <SentimentDissatisfied />
                    <Typography variant="p" sx={{ marginTop: "1rem" }}>No Products found</Typography>
                  </Grid> :
                  (
                    <Grid container spacing={1} sx={{ padding: "3rem 4rem" }} >
                      {
                        products && products.map(product => (
                          <Grid item md={3} sm={6} key={product._id} >
                            <ProductCard
                              product={product}
                              handleAddToCart={() => addToCart(
                                localStorage.getItem("token"),
                                fetchedCart,
                                products,
                                product._id,
                                1,
                                { preventDuplicate: true }
                              )} />
                          </Grid>
                        ))

                      }
                    </Grid>
                  ))
            }

          </Box>
        </Grid>

        {/* Cart */}
        {
          localStorage.getItem("username") ?
            <Grid item md={3} xs={12} bgcolor="#E9F5E1">
                <Cart products={products} items={cartList} handleQuantity={addToCart} /> 
            </Grid> :
            null
        }
      </Grid>

      <Footer />
    </div>
  );
};

export default Products;