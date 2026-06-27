import { Link } from "react-router-dom";

const menu = [
  ["Dashboard","/dashboard"],
  ["Resume","/resume"],
  ["ATS","/ats"],
  ["Interview","/interview"],
  ["Skill Gap","/skillgap"],
  ["Roadmap","/roadmap"],
  ["Chatbot","/chatbot"],
  ["Profile","/profile"],
  ["Settings","/settings"]
];

export default function Sidebar(){

return(

<div className="w-72 bg-slate-900 p-6">

<h1 className="text-blue-500 text-3xl font-bold mb-8">

CareerPilot AI

</h1>

{menu.map((m)=>(

<Link

key={m[0]}

to={m[1]}

className="block p-3 text-white hover:bg-blue-600 rounded-lg mb-2"

>

{m[0]}

</Link>

))}

</div>

)

}