import React, { useState } from 'react'
import  './AddProduct.css'
import upload_area from '../../assets/upload_area.svg'




const AddProduct = () => {

  const [image,SetImage] = useState(false);
  const [productDetails, setProductDetails] = useState({
    name:"",
    image:"",
    category:"women",
    new_price:"",
    old_price:""
  })

  const imageHandler = (e) =>{
    SetImage(e.target.files[0]);
    
  }

  const changeHandler = (e) =>{
    setProductDetails({...productDetails, [e.target.name]:e.target.value})
  }

  {/*
  const Add_Product = async () =>{
    console.log(productDetails);

    let responseData;
    let product = productDetails;

    let formData = new FormData();
    formData.append('product', image);

    await fetch('http://localhost:4000/upload', {
      method: 'POST',
      headers: {
        Accept:'application/json',
      },
      body:formData,
    }).then((resp) => resp.json()).then((data) =>{responseData = data});

    if (responseData.success)
    {
      product.image = responseData.image_url;
      console.log(product);
      await fetch('http://localhost:4000/addproduct',{
        method:'POST',
        headers:{
          Accept:'application/json',
          'Content-Type': 'application/json',
        },
        body:JSON.stringify(product),       
      }).then((resp)=>resp.arrayBuffer.json()).then((data)=>{

        data.success?alert("Product Added"):alert("Failed")
      })
    }


  }
  */}


  const Add_Product = async () => {
    console.log("Initial productDetails:", productDetails);
  
    let formData = new FormData();
    formData.append('product', image);
  
    try {
      // First fetch: Upload the image
      const uploadResponse = await fetch('http://localhost:4000/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (!uploadResponse.ok) {
        throw new Error(`HTTP error! status: ${uploadResponse.status}`);
      }
  
      const responseData = await uploadResponse.json();
      console.log("Upload response:", responseData);
  
      if (responseData.sucess === 1) { // Note: 'sucess' is misspelled in the response
        const updatedProduct = {
          ...productDetails,
          image: responseData.image_url
        };
        console.log("Updated product with image URL:", updatedProduct);
  
        // Second fetch: Add the product
        const addProductResponse = await fetch('http://localhost:4000/addproduct', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedProduct),
        });
  
        if (!addProductResponse.ok) {
          throw new Error(`HTTP error! status: ${addProductResponse.status}`);
        }
  
        const addProductData = await addProductResponse.json();
        console.log("Add product response:", addProductData);
  
        if (addProductData.success) {
          alert("Product Added");
          setProductDetails(updatedProduct); // Update the state with the new product details
        } else {
          alert("Failed to add product to database");
        }
      } else {
        alert("Failed to upload image");
      }
    } catch (error) {
      console.error('There was a problem with the operation:', error.message);
      alert("An error occurred. Please try again.");
    }
  };
  
  
  return (
    <div className='add-product'>
      <div className='addproduct-itemfield'>
        <p>Product title</p>
        <input value={productDetails.name} onChange={changeHandler} type='text' name='name' placeholder='Type here' />
      </div>
      <div className='addproduct-itemfield'>
        <p>Price</p>
        <input value={productDetails.old_price} onChange={changeHandler} type='text' name='old_price' placeholder='Type here' />
      </div>
      <div className='addproduct-itemfield'>
        <p>Offer Price</p>
        <input value={productDetails.new_price} onChange={changeHandler} type='text' name='new_price' placeholder='Type here' />
      </div>
      <div className='addproduct-itemfield'>
        <p>Product Category</p>
        <select value={productDetails.name} onChange={changeHandler} name="category" className='addproduct-selector'>
          <option value="women">Women</option>
          <option value="men">Mens</option>
          <option value="kid">Kid</option>
        </select>
      </div>
      <div className='addproduct-itemfield'>
        <label htmlFor='file-input'>
          <img className="addproduct-thumbnail-img" src={image?URL.createObjectURL(image):upload_area} alt="" />
        </label>
        <input onChange={imageHandler} type="file" name="image" id="file-input" hidden />
      </div>
      <button onClick = {() => {Add_Product()}} className='addProduct-btn'>ADD</button> 


    </div>
  )
}

export default AddProduct