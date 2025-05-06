import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'Full name must be at least 3 characters',
  fullNameTooLong: 'Full name must be at most 20 characters',
  sizeIncorrect: 'Size must be S or M or L',
  toppingsRequired: 'At least one topping must be selected',
};

// 👇 Here you will create your schema.
const pizzaSchema = Yup.object().shape({
  fullName: Yup.string()
    .trim()
    .min(3, validationErrors.fullNameTooShort)
    .max(20, validationErrors.fullNameTooLong)
    .required('Full name is required'),
  size: Yup.string()
    .oneOf(['S', 'M', 'L'], validationErrors.sizeIncorrect)
    .required('Size is required'),
  toppings: Yup.array().required(validationErrors.toppingsRequired),
});

// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppingsData = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
];

export default function Form() {
  const [formData, setFormData] = useState({
    fullName: '',
    size: '',
    toppings: [],
  });
  const [errors, setErrors] = useState({});
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderMessage, setOrderMessage] = useState('');
  const [orderFailure, setOrderFailure] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const validateForm = async (data) => {
    try {
      await pizzaSchema.validate(data, { abortEarly: false });
      return {};
    } catch (err) {
      const newErrors = {};
      err.inner.forEach((e) => {
        newErrors[e.path] = e.message;
      });
      return newErrors;
    }
  };

  useEffect(() => {
    const validate = async () => {
      const currentErrors = await validateForm(formData);
      setErrors(currentErrors);
      setIsSubmitDisabled(Object.keys(currentErrors).length > 0);
    };
    validate();
  }, [formData]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    console.log(`handleChange: id=${id} value=${value}`);
    setFormData({ ...formData, [id]: value });
  };

  const handleToppingChange = (toppingId) => {
    const toppingValue = String(toppingId);
    const currentToppings = formData.toppings;

    if (currentToppings.includes(toppingValue)) {
      setFormData({
        ...formData,
        toppings: currentToppings.filter((id) => id !== toppingValue),
      });
    } else {
      setFormData({
        ...formData,
        toppings: [...currentToppings, toppingValue],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); 
    const currentErrors = await validateForm(formData);
    setErrors(currentErrors);

    if (Object.keys(currentErrors).length === 0) {
      try {
        console.log('Form submitted with values:', formData);
        const success = Math.random() > 0.3;
        if (success) {
          const sizeText =
            formData.size === 'S'
              ? 'small'
              : formData.size === 'M'
              ? 'medium'
              : 'large';
          const toppingCount = formData.toppings.length;
          let toppingMessage = '';
          if (toppingCount === 0) {
            toppingMessage = 'with no toppings';
          } else if (toppingCount === 1) {
            toppingMessage = 'with 1 topping';
          } else {
            toppingMessage = `with ${toppingCount} toppings`;
          }

          const message = `Thank you for your order, ${formData.fullName}! Your ${sizeText} pizza ${toppingMessage}`;
          setOrderMessage(message.trim());
          setOrderSuccess(true);
          setOrderFailure(false);
          setFormData({
            fullName: '',
            size: '',
            toppings: [],
          });
        } else {
          setOrderSuccess(false);
          setOrderFailure(true);
          setOrderMessage('');
        }
      } catch (error) {
        console.error("Error during submission:", error);
        setOrderFailure(true);
        setOrderSuccess(false);
        setOrderMessage('');
      } finally {
        setIsSubmitting(false);
      }
    } else {
        setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (orderSuccess || orderFailure) {
      const timer = setTimeout(() => {
        setOrderSuccess(false);
        setOrderFailure(false);
        setOrderMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [orderSuccess, orderFailure]);

  return (
    <form onSubmit={handleSubmit}>
      <h2>Order Your Pizza</h2>
      {orderSuccess && <div className="success">{orderMessage}</div>}
      {orderFailure && <div className="failure">Something went wrong</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label>
          <br />
          <input
            placeholder="Type full name"
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>
        {errors.fullName && <div className="error">{errors.fullName}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label>
          <br />
          <select id="size" value={formData.size} onChange={handleChange}>
            <option value="">----Choose Size----</option>
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
          </select>
        </div>
        {errors.size && <div className="error">{errors.size}</div>}
      </div>

      <div className="input-group">
        {/* 👇 Generate the checkboxes dynamically */}
        {toppingsData.map((topping) => (
          <label key={topping.topping_id}>
            <input
              name={`topping-${topping.topping_id}`}
              type="checkbox"
              value={topping.topping_id}
              checked={formData.toppings.includes(String(topping.topping_id))}
              onChange={() => handleToppingChange(topping.topping_id)}
            />
            {topping.text}
            <br />
          </label>
        ))}
        {errors.toppings && <div className="error">{errors.toppings}</div>}
      </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <input type="submit" disabled={isSubmitDisabled || isSubmitting} />
    </form>
  );
}
