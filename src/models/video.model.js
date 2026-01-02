import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new mongoose.Schema({
    title: {
        type: "String",//cloudinary se ayega
        required: true
    },
    description: {
        type: "String",
        required: true
    },
    url: {
        type: "String",
        required: true
    },
    thumbnail: {
        type: "String",
        required: true
    },
    duration: {
        type: "String",//cloudinary se ayega
        required: true
    }
}, { timestamps: true });

const Video = mongoose.model("Video", videoSchema);

export default Video;
