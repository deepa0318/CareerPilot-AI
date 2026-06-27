import Layout from "../components/Layout";

export default function Interview(){

return(

<Layout>

<h1 className="text-white text-4xl">

AI Interview Coach

</h1>

<div className="bg-slate-900 mt-8 p-6 rounded-xl">

<p className="text-white">

Tell me about yourself.

</p>

<textarea

rows="8"

className="w-full mt-6 rounded p-4"

/>

<button

className="bg-blue-600 px-6 py-3 mt-6 rounded text-white"

>

Evaluate Answer

</button>

</div>

</Layout>

)

}