import mongoose from "mongoose"

export const Order = () => {
  const orderSchema = new mongoose.Schema({
        state: {
            type: String,
            enum: ['accepted', 'preparing', 'finshed'],
        },
    });
  return mongoose.model('Order', orderSchema);
}
