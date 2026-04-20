import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.UPI_API_KEY || "",
    key_secret: process.env.UPI_SECRET || "",
});

export default razorpay;
