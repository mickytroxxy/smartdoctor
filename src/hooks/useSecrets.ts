import {useSelector } from "react-redux";
import { RootState } from "../state/store";
import { useEffect } from "react";
import { createData } from "../helpers/api";

export const useSecrets = () => {
    const {secrets} = useSelector((state: RootState) => state.globalVariables);
    
    // useEffect(() => {
    //     createData("secrets","1",secrets);
    // },[])
    return {secrets}
}