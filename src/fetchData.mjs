import axios from "axios";
const fetchData=async ()=>{
    const response =await axios.get("https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json");
    // console.log(response.data)
    return response.data;
}
export default fetchData;
