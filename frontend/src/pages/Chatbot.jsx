import Layout from "../components/Layout";
import { useState } from "react";

export default function Chatbot() {

const [question,setQuestion]=useState("");

const [answer,setAnswer]=useState("");

async function askAI(){

const res=await fetch("http://127.0.0.1:8000/chat",{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

question

})

});

const data=await res.json();

setAnswer(data.answer);

}

return(

<Layout>

<h1 className="text-white text-4xl">

AI Career Chatbot

</h1>

<textarea

className="w-full mt-6 p-4 rounded"

rows="6"

onChange={(e)=>setQuestion(e.target.value)}

/>

<button

onClick={askAI}

className="bg-blue-600 px-6 py-3 rounded mt-4 text-white"

>

Ask AI

</button>

<div className="bg-slate-900 mt-8 p-6 rounded-xl text-white">

{answer}

</div>

</Layout>

)

}