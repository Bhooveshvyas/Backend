// DB CONNECT KRNE KE 2 ZARIYE -> 1. SARA CODE INDEX.JS MEIN HI LIKHDO 2. ALAG SE DB KRKE FOLDER BANO FR USKA CODE INDEX.JS MEIN IMPORT KRDO
// WE WILL LOOK FIRST THE 1. METHOD i.e. WRITING ALL THE CODE IN THE INDEX.JS FILE ITSELF.
// require('dotenv').config({path: './env'})  --- IGNORE --- krenge isko kyoki baki ka code jo hai wo module type mein likha hai aur yeh jo hai wo common js hai islie ya to  full common js ya to module js.
import mongoose from 'mongoose'
import DB_NAME from './constants.js'
import connectDB from './db/index.js'
import dotenv from 'dotenv'

// dotenv.config({ path: './env' })

connectDB();

























/*
import express from "express"
const app = express();

// we will use iffe (Immediately Invoked Function Expression) to connect to the database
; (async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("Error", error);
        })
        app.listen(process.env.PORT, () => {
            console.log("SERVEVR IS UP");
        })
    } catch (err) {
        console.error("ERROR : ", err);
        // throw err
    }
})()
*/