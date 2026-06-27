import Layout from "../components/Layout";

export default function Resume(){

return(

<Layout>

<h1 className="text-white text-4xl">

Resume Analyzer

</h1>

<div className="bg-slate-900 mt-8 p-10 rounded-xl border-2 border-dashed border-gray-500">

<p className="text-gray-300">

Drag and Drop Resume Here

</p>

<input

type="file"

className="mt-4 text-white"

/>

<button

className="bg-blue-600 mt-6 px-6 py-3 rounded text-white"

>

Analyze Resume

</button>

</div>

</Layout>

)

}