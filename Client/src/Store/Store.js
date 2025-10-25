import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./AuthUserSlice";
import usersData from "./UsersDataSlice";
import evaluations from "./EvaluationSlice";



const store = configureStore({
    reducer: {
        auth: authReducer,
        usersData:usersData,
        evaluations:evaluations
     
    }
})

export default store