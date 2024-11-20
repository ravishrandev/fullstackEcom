import React, { createContext, useEffect, useState } from "react";
//import all_product from "../Components/Assets/all_product";
import Product from "../Pages/Product";

export const ShopContext = createContext(null);

const getDefaultCart = ()=>{
    let cart = {};
    for (let index = 0; index < 300+1; index++) {
        cart[index] = 0;
    }
    return cart;
}

const ShopContextProvider = (props) => {

    const [all_product, setAll_Product] =useState([]);
    const [cartItems, setCartItems] = useState(getDefaultCart());

    useEffect(() => {
        fetch('http://localhost:4000/allproducts')
            .then((response) => response.json())
            .then((data) => {
                console.log("Fetched data:", data);
                setAll_Product(data);
            });
    
        if(localStorage.getItem('auth-token')){
            fetch('http://localhost:4000/getcart', {  // Fixed the syntax error here - removed ) and added ,
                method: 'POST',
                headers: {
                    Accept: 'application/json',  // Changed to application/json for consistency
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                    'Content-Type': 'application/json',
                },
                body: ""
            })
            .then((response) => response.json())
            .then((data) => setCartItems(data))
            .catch(err => console.error("Fetch error:", err));  // Added error handling
        }
    }, []);

    const addToCart = (itemId) =>{
        setCartItems((prev) => ({...prev, [itemId]: prev[itemId]+1}));

        if (localStorage.getItem('auth-token')) {
            fetch('http://localhost:4000/addtocart', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',  // Changed from form-data
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({"itemId": itemId})
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                console.log("Server response:", data);
            })
            .catch((error) => {
                console.error("Error adding to cart:", error);
            });
        }
    }

    const removeFromCart = (itemId) =>{
        setCartItems((prev)=>({...prev,[itemId]:prev[itemId]-1}));
        if (localStorage.getItem('auth-token')){
            fetch('http://localhost:4000/removefromcart', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',  // Changed from form-data
                    'auth-token': `${localStorage.getItem('auth-token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({"itemId": itemId})
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                console.log("Server response:", data);
            })
            .catch((error) => {
                console.error("Error removing from cart:", error);
            });
            
        }
    }

    
    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
          if (cartItems[item] > 0) {
            let itemInfo = all_product.find((product) => product.id === Number(item));
            totalAmount += cartItems[item] * itemInfo.new_price;
          }
        }
        return totalAmount;
      }

    
    const getTotalCartItems = () =>{
    let totalItem = 0;
    for(const item in cartItems)
    {
        if(cartItems[item]>0)
        {
            totalItem+= cartItems[item];
        }
    }
    return totalItem;
    }




    const contextValue = {all_product, cartItems, addToCart, removeFromCart, getTotalCartAmount, getTotalCartItems};
    

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;