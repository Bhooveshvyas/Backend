import mongoose, { Schema } from 'mongoose'

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User"//one who is subscribing.
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User"//one whom  is subscriber is subcribing.
    }
}, { timestamps })

export const subscription = mongoose.model("subscriptionSchema", subscriptionSchema);