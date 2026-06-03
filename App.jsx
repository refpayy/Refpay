import { useState, useEffect, useRef } from "react";

const PLANS = [
  { amount:500,  usd:1.8,  split:250,  label:"Starter",  color:"#a78bfa", icon:"⚡", desc:"Perfect for beginners" },
  { amount:1000, usd:3.6,  split:500,  label:"Basic",    color:"#c8a84b", icon:"🥉", desc:"Most popular choice" },
  { amount:2000, usd:7.2,  split:1000, label:"Silver",   color:"#94a3b8", icon:"🥈", desc:"Double your earnings" },
  { amount:3000, usd:10.8, split:1500, label:"Gold",     color:"#f5c842", icon:"👑", desc:"Serious earners only" },
  { amount:4000, usd:14.4, split:2000, label:"Platinum", color:"#7dd3fc", icon:"💎", desc:"Premium tier benefits" },
  { amount:5000, usd:18.0, split:2500, label:"Diamond",  color:"#86efac", icon:"💠", desc:"Maximum earning potential" },
];

const MIN_WITHDRAW = 500;
const ADMIN_PHONE = "03331942804";
const ADMIN_PASSWORD = "9Xflix.com.refpay";

const FAKE_WITHDRAWALS = [
  {name:"Ahmed K.",amount:1000},{name:"Sara M.",amount:500},{name:"Bilal R.",amount:5000},
  {name:"Zara N.",amount:1000},{name:"Usman T.",amount:2000},{name:"Hina F.",amount:500},
  {name:"Kamran A.",amount:3000},{name:"Nadia S.",amount:1000},{name:"Faisal H.",amount:5000},
  {name:"Ayesha Q.",amount:500},{name:"Tariq B.",amount:2000},{name:"Maryam L.",amount:1000},
];

function uid(){ return "U"+Date.now().toString(36).toUpperCase()+Math.floor(Math.random()*99); }
function tid(){ return "T"+Date.now().toString(36).toUpperCase(); }
function mkCode(n){
  const letters="ABCDEFGHJKLMNPQRSTUVWXYZ";
  const prefix=(n||"USR").slice(0,3).toUpperCase().replace(/[^A-Z]/g,"X");
  const suffix=Math.floor(1000+Math.random()*9000);
  return prefix+suffix;
}
function getPlan(a){ return PLANS.find(p=>p.amount===Number(a))||PLANS[0]; }
function toUSD(pkr){ return (pkr/278).toFixed(2); }

const DB = {
  users: {
    ADMIN: {
      id:"ADMIN", name:"Admin", phone:ADMIN_PHONE, password:ADMIN_PASSWORD,
      role:"admin", balance:0, totalEarned:0,
      referralCode:"REFPAY2025", referredBy:null,
      depositDone:true, canRefer:true,
      joinDate:"2025-01-01", transactions:[], withdrawals:[],
    }
  },
  transactions:[], withdrawals:[],
  tasks:[], taskSubmissions:[],
  settings:{ adminEasypaisa: ADMIN_PHONE },
  announcements:[
    { id:"ann1", type:"gift", title:"🎁 Weekly Gift Bonus", desc:"Top 3 earners this week receive a bonus reward. Stay active!", date:"Coming Soon", color:"#f5c842" },
    { id:"ann2", type:"coming", title:"🚀 RefPay Pro Launch", desc:"Advanced analytics, instant withdrawals & team dashboards. Coming Q2 2025.", date:"Q2 2025", color:"#a78bfa" },
    { id:"ann3", type:"coming", title:"📱 Mobile App Release", desc:"Native iOS & Android app with push notifications launching soon.", date:"Coming Soon", color:"#7dd3fc" },
  ],
};

const GS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Clash+Display:wght@700;800&family=Bebas+Neue&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#050508;font-family:'Outfit',sans-serif;color:#e8e8ff;overflow-x:hidden}
  input,textarea,select{font-family:'Outfit',sans-serif}
  input::placeholder,textarea::placeholder{color:#252535}
  input:focus,textarea:focus,select:focus{outline:none;border-color:#6d28d9!important;box-shadow:0 0 0 3px #6d28d910!important}
  ::-webkit-scrollbar{width:2px}
  ::-webkit-scrollbar-thumb{background:#6d28d933;border-radius:4px}
  @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes glow{0%,100%{box-shadow:0 0 30px #6d28d915,0 0 60px #b4840810}50%{box-shadow:0 0 50px #6d28d930,0 0 100px #b4840818}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
  @keyframes rain{0%{transform:translateY(-30px) rotate(0deg);opacity:0}5%{opacity:.8}90%{opacity:.3}100%{transform:translateY(105vh) rotate(360deg);opacity:0}}
  @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
  @keyframes toast{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
  @keyframes ticker{from{transform:translateX(100%)}to{transform:translateX(-100%)}}
  @keyframes countup{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}
  @keyframes neon{0%,100%{text-shadow:0 0 10px #b484085a,0 0 20px #b484084a,0 0 30px #b4840830}50%{text-shadow:0 0 20px #b48408aa,0 0 40px #b4840888,0 0 60px #b4840855}}
  @keyframes scanline{0%{top:-20%}100%{top:120%}}
  @keyframes borderGlow{0%,100%{border-color:#6d28d944}50%{border-color:#b4840866}}
  .btn-press:active{transform:scale(.96)!important}
  .hoverable:hover{transform:translateY(-3px);transition:all .25s cubic-bezier(.34,1.56,.64,1)}
  .ticker-wrap{overflow:hidden;white-space:nowrap;position:relative}
  .ticker-content{display:inline-block;animation:ticker 22s linear infinite}
`;

function Particles(){
  const shapes=["◆","✦","●","◇","✧","▸","⬡","◉"];
  const colors=["#6d28d9","#b48408","#a78bfa","#f5c84255","#7dd3fc33"];
  const p=Array.from({length:25},(_,i)=>({
    id:i, s:shapes[i%shapes.length],
    l:`${i*3.8+Math.random()*3}%`,
    del:`${Math.random()*14}s`, dur:`${10+Math.random()*10}s`,
    sz:`${8+Math.random()*8}px`, op:0.015+Math.random()*.04,
    c:colors[i%colors.length],
  }));
  return(
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      {p.map(d=>(
        <div key={d.id} style={{position:"absolute",left:d.l,top:"-30px",fontSize:d.sz,color:d.c,opacity:d.op,animation:`rain ${d.dur} ${d.del} linear infinite`}}>{d.s}</div>
      ))}
    </div>
  );
}

function WithdrawTicker(){
  const [idx,setIdx]=useState(0);
  const [key,setKey]=useState(0);
  useEffect(()=>{
    const t=setInterval(()=>{
      setIdx(i=>(i+1)%FAKE_WITHDRAWALS.length);
      setKey(k=>k+1);
    },4000);
    return()=>clearInterval(t);
  },[]);
  const w=FAKE_WITHDRAWALS[idx];
  return(
    <div style={{background:"linear-gradient(90deg,#0a0900,#110f00,#0a0900)",borderTop:"1px solid #b4840822",borderBottom:"1px solid #b4840822",padding:"9px 0",overflow:"hidden",position:"relative"}}>
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:40,background:"linear-gradient(90deg,#050508,transparent)",zIndex:2}}/>
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:40,background:"linear-gradient(270deg,#050508,transparent)",zIndex:2}}/>
      <div key={key} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,animation:"fadeIn .5s ease"}}>
        <span style={{fontSize:11,color:"#b48408",fontWeight:700,letterSpacing:.5}}>💸 LIVE</span>
        <span style={{width:6,height:6,borderRadius:"50%",background:"#22c55e",display:"inline-block",boxShadow:"0 0 8px #22c55e"}}/>
        <span style={{fontSize:12,color:"#8a7020",fontWeight:500}}>
          <span style={{color:"#c8a84b",fontWeight:700}}>{w.name}</span> just withdrew <span style={{color:"#f5e070",fontWeight:800,animation:"neon 2s ease-in-out infinite"}}>PKR {w.amount.toLocaleString()}</span> successfully
        </span>
        <span style={{fontSize:11,color:"#22c55e",fontWeight:700}}>✦ PAID</span>
      </div>
    </div>
  );
}

function Logo({size=1}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:10*size}}>
      <div style={{position:"relative",width:44*size,height:44*size}}>
        <div style={{width:"100%",height:"100%",borderRadius:14*size,background:"linear-gradient(135deg,#4c1d95,#6d28d9,#b48408)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22*size,boxShadow:`0 0 28px #6d28d955,inset 0 1px 0 #ffffff15`}}>
          <span>💸</span>
        </div>
      </div>
      <div>
        <div style={{fontFamily:"'Outfit',sans-serif",fontSize:24*size,fontWeight:900,letterSpacing:-1,background:"linear-gradient(135deg,#c4b5fd 0%,#b48408 55%,#fde68a 100%)",backgroundSize:"200%",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"shimmer 6s linear infinite",lineHeight:1}}>RefPay</div>
        {size>=1&&<div style={{fontSize:8,color:"#2a2a4a",letterSpacing:4,textTransform:"uppercase",marginTop:1,fontWeight:500}}>Global Earning Network</div>}
      </div>
    </div>
  );
}

function Toast({msg,type,onClose}){
  useEffect(()=>{const t=setTimeout(onClose,3500);return()=>clearTimeout(t);},[]);
  const colors={success:"#10b981",error:"#ef4444",info:"#a78bfa"};
  const c=colors[type]||"#a78bfa";
  return(
    <div style={{position:"fixed",bottom:32,left:"50%",transform:"translateX(-50%)",background:"#0c0c18",border:`1px solid ${c}44`,color:c,padding:"13px 26px",borderRadius:50,fontWeight:700,fontSize:13,zIndex:9999,whiteSpace:"nowrap",boxShadow:`0 8px 40px ${c}25,0 0 0 1px ${c}11`,animation:"toast .3s cubic-bezier(.34,1.56,.64,1)",letterSpacing:.3}}>
      {type==="success"?"✦":type==="error"?"✕":"◆"} {msg}
    </div>
  );
}

function Inp({label,value,onChange,type="text",placeholder,hint,rows,required}){
  return(
    <div style={{marginBottom:16}}>
      {label&&<div style={{fontSize:10,fontWeight:700,color:"#3a3a5a",marginBottom:6,letterSpacing:2,textTransform:"uppercase",display:"flex",gap:4,alignItems:"center"}}>{label}{required&&<span style={{color:"#ef4444"}}>*</span>}</div>}
      {rows
        ?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{width:"100%",background:"#08080f",border:"1.5px solid #16162a",borderRadius:12,padding:"13px 15px",color:"#e8e8ff",fontSize:14,resize:"vertical",transition:"all .2s"}}/>
        :<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",background:"#08080f",border:"1.5px solid #16162a",borderRadius:12,padding:"13px 15px",color:"#e8e8ff",fontSize:14,transition:"all .2s"}}/>
      }
      {hint&&<div style={{fontSize:11,color:"#2a2a4a",marginTop:5,lineHeight:1.5}}>{hint}</div>}
    </div>
  );
}

function Btn({ch,onClick,v="primary",disabled=false,s={}}){
  const vs={
    primary:{background:"linear-gradient(135deg,#5b21b6,#7c3aed,#8b5cf6)",color:"#fff",border:"none",boxShadow:"0 4px 24px #6d28d940"},
    gold:{background:"linear-gradient(135deg,#92400e,#b48408,#d97706,#f5c842)",backgroundSize:"200%",animation:"shimmer 3s linear infinite",color:"#0a0600",border:"none",boxShadow:"0 4px 20px #b4840840"},
    green:{background:"linear-gradient(135deg,#064e3b,#065f46,#059669)",color:"#d1fae5",border:"none"},
    red:{background:"linear-gradient(135deg,#450a0a,#7f1d1d,#b91c1c)",color:"#fca5a5",border:"none"},
    ghost:{background:"transparent",border:"1.5px solid #6d28d933",color:"#a78bfa"},
    dark:{background:"#08080f",border:"1.5px solid #16162a",color:"#3a3a5a"},
    silver:{background:"linear-gradient(135deg,#1e293b,#334155)",color:"#cbd5e1",border:"1px solid #334155"},
  };
  return(
    <button className="btn-press" onClick={onClick} disabled={disabled} style={{...vs[v],padding:"14px 20px",width:"100%",borderRadius:13,fontWeight:700,fontSize:13,cursor:disabled?"not-allowed":"pointer",opacity:disabled?.35:1,transition:"all .2s",letterSpacing:.5,...s}}>{ch}</button>
  );
}

function Card({children,glow=false,color="#6d28d9",s={}}){
  return(
    <div className="hoverable" style={{background:"#0c0c18",border:`1px solid ${glow?color+"33":"#16162a"}`,borderRadius:20,padding:18,boxShadow:glow?`0 0 32px ${color}12,inset 0 1px 0 ${color}08`:"inset 0 1px 0 #ffffff04",...s}}>{children}</div>
  );
}

function Badge({l,c="#a78bfa"}){
  return <span style={{background:c+"18",color:c,borderRadius:20,padding:"3px 11px",fontSize:10,fontWeight:700,border:`1px solid ${c}22`,letterSpacing:.5}}>{l}</span>;
}

function StatsBar({users}){
  const totalUsers=Object.values(DB.users).filter(u=>u.role!=="admin").length;
  const activeUsers=Object.values(DB.users).filter(u=>u.role!=="admin"&&u.depositDone).length;
  const pendingUsers=Object.values(DB.users).filter(u=>u.role!=="admin"&&!u.depositDone).length;
  return(
    <div style={{background:"linear-gradient(135deg,#0c0a20,#08080f)",border:"1px solid #6d28d922",borderRadius:16,padding:14,marginBottom:14}}>
      <div style={{fontSize:10,fontWeight:700,color:"#3a3a5a",letterSpacing:2,textTransform:"uppercase",marginBottom:11}}>📊 Platform Stats (Live)</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9}}>
        {[
          {l:"Registered",v:totalUsers,c:"#a78bfa",i:"👥"},
          {l:"Active Members",v:activeUsers,c:"#22c55e",i:"✦"},
          {l:"Pending",v:pendingUsers,c:"#f5c842",i:"⏳"},
        ].map(s=>(
          <div key={s.l} style={{background:"#08080f",border:"1px solid #16162a",borderRadius:12,padding:"11px 8px",textAlign:"center"}}>
            <div style={{fontSize:18,marginBottom:4}}>{s.i}</div>
            <div style={{fontFamily:"'Outfit',sans-serif",fontSize:20,fontWeight:900,color:s.c,letterSpacing:-0.5}}>{s.v}</div>
            <div style={{fontSize:9,color:"#2a2a4a",marginTop:2,letterSpacing:.5,fontWeight:600}}>{s.l.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RankingSystem(){
  const users=Object.values(DB.users).filter(u=>u.role!=="admin");
  const ranked=users.map(u=>{
    const refs=Object.values(DB.users).filter(x=>x.referrerId===u.id&&x.depositDone).length;
    return {...u,refs};
  }).sort((a,b)=>b.refs-a.refs).slice(0,5);

  const getRank=(refs)=>{
    if(refs>=1000)return{label:"🏆 Legend",color:"#fde68a",bg:"#78350f"};
    if(refs>=500)return{label:"💠 Diamond",color:"#7dd3fc",bg:"#0c4a6e"};
    if(refs>=100)return{label:"👑 Gold",color:"#f5c842",bg:"#713f12"};
    if(refs>=50)return{label:"🥈 Silver",color:"#94a3b8",bg:"#1e293b"};
    if(refs>=10)return{label:"🥉 Bronze",color:"#c8a84b",bg:"#1c1008"};
    return{label:"⚡ Starter",color:"#a78bfa",bg:"#1e0a3e"};
  };

  return(
    <div style={{marginBottom:14}}>
      <div style={{fontFamily:"'Outfit',sans-serif",fontSize:16,fontWeight:800,color:"#fff",marginBottom:6}}>🏆 Ranking Board</div>
      <div style={{fontSize:11,color:"#3a3a5a",marginBottom:12}}>Reach 1000 referrals → Auto Promotion to Legend Rank</div>
      <div style={{background:"#0c0c18",border:"1px solid #b4840822",borderRadius:16,overflow:"hidden"}}>
        <div style={{padding:"12px 14px",borderBottom:"1px solid #16162a",display:"grid",gridTemplateColumns:"30px 1fr auto auto",gap:8,alignItems:"center"}}>
          <div style={{fontSize:9,color:"#2a2a4a",fontWeight:700,letterSpacing:1}}>#</div>
          <div style={{fontSize:9,color:"#2a2a4a",fontWeight:700,letterSpacing:1}}>MEMBER</div>
          <div style={{fontSize:9,color:"#2a2a4a",fontWeight:700,letterSpacing:1}}>REFS</div>
          <div style={{fontSize:9,color:"#2a2a4a",fontWeight:700,letterSpacing:1}}>RANK</div>
        </div>
        {ranked.length===0?(
          <div style={{textAlign:"center",padding:"30px 0",color:"#2a2a4a",fontSize:12}}>No members yet. Be the first!</div>
        ):ranked.map((u,i)=>{
          const rank=getRank(u.refs);
          return(
            <div key={u.id} style={{padding:"12px 14px",borderBottom:"1px solid #16162a",display:"grid",gridTemplateColumns:"30px 1fr auto auto",gap:8,alignItems:"center",background:i===0?"#0f0a18":"transparent"}}>
              <div style={{fontSize:14,fontWeight:900,color:i===0?"#f5c842":i===1?"#94a3b8":i===2?"#c8a84b":"#2a2a4a"}}>
                {i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}`}
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"#ccc"}}>{u.name}</div>
                <div style={{fontSize:9,color:"#2a2a4a"}}>{u.referralCode}</div>
              </div>
              <div style={{fontSize:14,fontWeight:900,color:"#c8a84b"}}>{u.refs}</div>
              <div style={{background:rank.bg,color:rank.color,borderRadius:20,padding:"2px 8px",fontSize:9,fontWeight:700,border:`1px solid ${rank.color}22`}}>{rank.label}</div>
            </div>
          );
        })}
      </div>
      <div style={{marginTop:12,background:"#08080f",border:"1px solid #16162a",borderRadius:14,padding:13}}>
        <div style={{fontSize:11,fontWeight:700,color:"#b48408",marginBottom:8}}>📈 Promotion Milestones</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {[
            {refs:"10+",rank:"🥉 Bronze",color:"#c8a84b"},
            {refs:"50+",rank:"🥈 Silver",color:"#94a3b8"},
            {refs:"100+",rank:"👑 Gold",color:"#f5c842"},
            {refs:"500+",rank:"💠 Diamond",color:"#7dd3fc"},
            {refs:"1000+",rank:"🏆 Legend",color:"#fde68a"},
          ].map(m=>(
            <div key={m.refs} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#0c0c18",border:`1px solid ${m.color}15`,borderRadius:9,padding:"8px 10px"}}>
              <span style={{fontSize:10,color:"#4a4a6a",fontWeight:600}}>{m.refs} refs</span>
              <span style={{fontSize:10,fontWeight:700,color:m.color}}>{m.rank}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoadMap(){
  const steps=[
    {n:1,icon:"📝",title:"Register Account",desc:"Use a valid referral code to create your account. All fields required.",color:"#a78bfa"},
    {n:2,icon:"💰",title:"Make Your Deposit",desc:"Choose an investment plan (PKR 500–5000). Send via EasyPaisa or JazzCash to admin number.",color:"#c8a84b"},
    {n:3,icon:"✅",title:"Get Activated",desc:"Admin verifies your deposit within 1–24 hours. Your account activates & referral code unlocks.",color:"#22c55e"},
    {n:4,icon:"🔗",title:"Share Your Code",desc:"Share your unique referral code with friends, family, and social networks.",color:"#7dd3fc"},
    {n:5,icon:"💸",title:"Earn Per Referral",desc:"When someone registers & deposits using your code, you earn PKR 250–2,500 instantly.",color:"#f5c842"},
    {n:6,icon:"🎯",title:"Complete Tasks",desc:"Earn extra by completing tasks posted in Task Center. Video editing, reels, etc.",color:"#f87171"},
    {n:7,icon:"🏆",title:"Level Up & Withdraw",desc:"Reach higher ranks with more referrals. Withdraw earnings anytime (min PKR 500).",color:"#86efac"},
  ];
  return(
    <div style={{marginBottom:14}}>
      <div style={{fontFamily:"'Outfit',sans-serif",fontSize:16,fontWeight:800,color:"#fff",marginBottom:4}}>🗺️ How to Earn</div>
      <div style={{fontSize:11,color:"#3a3a5a",marginBottom:14}}>Complete roadmap to earning on RefPay</div>
      {steps.map((s,i)=>(
        <div key={s.n} style={{display:"flex",gap:12,marginBottom:i<steps.length-1?0:0,position:"relative"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
            <div style={{width:38,height:38,borderRadius:12,background:`${s.color}18`,border:`2px solid ${s.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,zIndex:1}}>{s.icon}</div>
            {i<steps.length-1&&<div style={{width:2,flex:1,background:`linear-gradient(${s.color}44,${steps[i+1].color}22)`,minHeight:20,marginTop:3,marginBottom:3}}/>}
          </div>
          <div style={{paddingBottom:i<steps.length-1?16:0,flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
              <span style={{fontSize:9,fontWeight:800,color:s.color,letterSpacing:1}}>STEP {s.n}</span>
            </div>
            <div style={{fontSize:13,fontWeight:700,color:"#e8e8ff",marginBottom:3}}>{s.title}</div>
            <div style={{fontSize:11,color:"#3a3a6a",lineHeight:1.6}}>{s.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EligibilityInfo(){
  return(
    <div style={{background:"linear-gradient(135deg,#0a0900,#0c0c00)",border:"1px solid #b4840833",borderRadius:18,padding:18,marginBottom:14}}>
      <div style={{fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:800,color:"#f5c842",marginBottom:12}}>⚡ Earning Eligibility Criteria</div>
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        {[
          {icon:"1️⃣",text:"Register using a valid referral code from an active member",c:"#a78bfa"},
          {icon:"2️⃣",text:"Make a deposit of PKR 500–5000 and wait for admin approval",c:"#c8a84b"},
          {icon:"3️⃣",text:"Once approved, your referral code activates automatically",c:"#22c55e"},
          {icon:"4️⃣",text:"Share your code — when someone registers AND deposits, you earn",c:"#7dd3fc"},
          {icon:"5️⃣",text:"Your earnings = 50% of their deposit plan value (PKR 250–2500)",c:"#f5c842"},
          {icon:"6️⃣",text:"Minimum PKR 500 needed to withdraw. Processing in 1–24 hours",c:"#f87171"},
          {icon:"7️⃣",text:"Complete tasks for additional income beyond referrals",c:"#86efac"},
        ].map((item,i)=>(
          <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",background:"#0a0a00",borderRadius:11,padding:"10px 12px",border:`1px solid ${item.c}15`}}>
            <span style={{fontSize:14,flexShrink:0}}>{item.icon}</span>
            <span style={{fontSize:12,color:"#8a7530",lineHeight:1.6,fontWeight:500}}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Agreement({name,onAccept}){
  const [checked,setChecked]=useState({c1:false,c2:false,c3:false,c4:false,c5:false,c6:false,c7:false,c8:false});
  const allChecked=Object.values(checked).every(Boolean);

  const clauses=[
    {id:"c1",text:"I confirm that I am voluntarily joining RefPay of my own free will, without any pressure, coercion, or false promises from any person, including the admin or any member."},
    {id:"c2",text:"I understand that RefPay is a referral-based earning platform. My earnings depend entirely on my own efforts in referring new members. No fixed income, salary, or profit is guaranteed."},
    {id:"c3",text:"I acknowledge that the admin (RefPay) is not responsible for any losses, failed referrals, or unmet expectations. All deposits are final and non-refundable once verified."},
    {id:"c4",text:"I will not attempt to defraud the platform by creating fake accounts, using fake transaction IDs, or manipulating the referral system in any way. Violation results in permanent ban."},
    {id:"c5",text:"I will not take any legal action, file complaints, or contact authorities against RefPay admin as I am joining voluntarily and understand the platform's nature."},
    {id:"c6",text:"I understand that withdrawal requests are processed within 1–24 hours and the admin is not liable for any delays caused by payment gateway issues."},
    {id:"c7",text:"I agree that RefPay may update its terms, plans, or commission structures at any time. Continued use implies acceptance of updated terms."},
    {id:"c8",text:"I confirm that all information I provide (name, phone, transaction ID) is accurate and truthful. Providing false information will result in account termination without refund."},
  ];

  return(
    <div style={{background:"#06060f",minHeight:"100vh",position:"relative",overflow:"hidden"}}>
      <Particles/>
      <div style={{position:"relative",zIndex:1,padding:"20px 18px 48px",animation:"fadeUp .35s ease"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <Logo size={1}/>
          <div style={{marginTop:20,background:"linear-gradient(135deg,#450a0a,#1a0a2e)",border:"1px solid #6d28d933",borderRadius:18,padding:"18px 16px"}}>
            <div style={{fontSize:22,marginBottom:8}}>📜</div>
            <div style={{fontFamily:"'Outfit',sans-serif",fontSize:17,fontWeight:900,color:"#fff",marginBottom:6}}>User Agreement & Terms</div>
            <div style={{fontSize:12,color:"#4a3a6a",lineHeight:1.6}}>Please read carefully and tick each clause to confirm your understanding. You must agree to all terms before creating your account.</div>
          </div>
        </div>

        <div style={{background:"#0c0c18",border:"1px solid #6d28d922",borderRadius:18,padding:16,marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:"#6d28d9",letterSpacing:1.5,textTransform:"uppercase",marginBottom:14}}>Agreement Clauses — Read & Confirm Each</div>
          {clauses.map((c,i)=>(
            <div key={c.id} onClick={()=>setChecked(p=>({...p,[c.id]:!p[c.id]}))} style={{display:"flex",gap:11,alignItems:"flex-start",padding:"12px 13px",marginBottom:8,borderRadius:12,cursor:"pointer",background:checked[c.id]?"#0d1f0d":"#08080f",border:`1.5px solid ${checked[c.id]?"#22c55e33":"#16162a"}`,transition:"all .2s"}}>
              <div style={{width:22,height:22,borderRadius:7,border:`2px solid ${checked[c.id]?"#22c55e":"#2a2a4a"}`,background:checked[c.id]?"#22c55e":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,transition:"all .2s"}}>
                {checked[c.id]&&<span style={{color:"#fff",fontSize:12,fontWeight:900}}>✓</span>}
              </div>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:checked[c.id]?"#22c55e":"#3a3a5a",letterSpacing:1,marginBottom:3}}>CLAUSE {i+1}</div>
                <div style={{fontSize:11,color:checked[c.id]?"#8abf8a":"#3a3a6a",lineHeight:1.65}}>{c.text}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{background:"#08080f",border:"1px solid #16162a",borderRadius:14,padding:14,marginBottom:16}}>
          <div style={{fontSize:11,color:"#4a4a6a",lineHeight:1.8}}>
            By clicking <span style={{color:"#22c55e",fontWeight:700}}>"I Agree & Create Account"</span>, <span style={{color:"#c8a84b",fontWeight:700}}>{name||"you"}</span> confirm that you have read, understood, and voluntarily agreed to all 8 clauses above. This constitutes a binding agreement between you and RefPay.
          </div>
        </div>

        <Btn ch={allChecked?"✦ I Agree & Create Account":"Please Accept All Clauses Above"} v={allChecked?"green":"dark"} disabled={!allChecked} onClick={onAccept}/>
        {!allChecked&&<div style={{textAlign:"center",fontSize:11,color:"#2a2a3a",marginTop:8}}>{Object.values(checked).filter(Boolean).length}/8 clauses accepted</div>}
      </div>
    </div>
  );
}

function Splash({onDone}){
  useEffect(()=>{const t=setTimeout(onDone,3000);return()=>clearTimeout(t);},[]);
  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"radial-gradient(ellipse 130% 80% at 50% 10%,#1e0a4e 0%,#050508 65%)",position:"relative",overflow:"hidden"}}>
      <Particles/>
      <div style={{position:"relative",zIndex:1,textAlign:"center",animation:"fadeUp .9s ease"}}>
        <div style={{position:"relative",width:150,height:150,margin:"0 auto 36px"}}>
          <div style={{position:"absolute",inset:0,borderRadius:"50%",border:"1.5px solid #6d28d933",animation:"spin 18s linear infinite",borderTopColor:"#6d28d988"}}/>
          <div style={{position:"absolute",inset:10,borderRadius:"50%",border:"1px solid #b4840822",animation:"spin 12s linear infinite reverse",borderRightColor:"#b4840866"}}/>
          <div style={{position:"absolute",inset:20,borderRadius:"50%",border:"1px solid #a78bfa11",animation:"spin 8s linear infinite",borderBottomColor:"#a78bfa44"}}/>
          <div style={{position:"absolute",inset:28,borderRadius:"50%",background:"radial-gradient(#1a0a3e,#050508)",display:"flex",alignItems:"center",justifyContent:"center",animation:"glow 3s ease-in-out infinite"}}>
            <span style={{fontSize:46}}>💸</span>
          </div>
        </div>
        <div style={{fontFamily:"'Outfit',sans-serif",fontSize:52,fontWeight:900,background:"linear-gradient(135deg,#c4b5fd 0%,#b48408 45%,#fde68a 100%)",backgroundSize:"200%",animation:"shimmer 4s linear infinite",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:-2,lineHeight:1,marginBottom:10}}>RefPay</div>
        <div style={{fontSize:12,color:"#2a2a4a",letterSpacing:6,textTransform:"uppercase",marginBottom:8}}>Global Earning Network</div>
        <div style={{fontSize:11,color:"#1a1a2a",letterSpacing:3}}>Trusted Worldwide</div>
        <div style={{display:"flex",gap:18,justifyContent:"center",marginTop:28}}>
          {["🇺🇸","🇬🇧","🇵🇰","🌍"].map((f,i)=>(
            <span key={i} style={{fontSize:22,opacity:.35,animation:`pulse 2.2s ${i*.35}s ease-in-out infinite`}}>{f}</span>
          ))}
        </div>
        <div style={{width:180,height:2,background:"#16162a",borderRadius:1,margin:"36px auto 0",overflow:"hidden"}}>
          <div style={{height:"100%",background:"linear-gradient(90deg,#6d28d9,#a78bfa,#b48408,#fde68a)",animation:"shimmer 2.2s ease-in-out infinite",backgroundSize:"300%",borderRadius:1}}/>
        </div>
        <div style={{fontSize:10,color:"#1a1a2a",marginTop:10,letterSpacing:3,fontWeight:600}}>LOADING...</div>
      </div>
    </div>
  );
}

function Auth({onLogin,toast}){
  const [tab,setTab]=useState("login");
  const [f,setF]=useState({name:"",phone:"",pw:"",ref:""});
  const [err,setErr]=useState("");
  const [showAgreement,setShowAgreement]=useState(false);
  const set=k=>v=>setF(p=>({...p,[k]:v}));

  const login=()=>{
    setErr("");
    if(f.phone===ADMIN_PHONE&&f.pw===ADMIN_PASSWORD){onLogin("ADMIN");return;}
    const u=Object.values(DB.users).find(u=>u.phone===f.phone&&u.password===f.pw);
    if(!u){setErr("Invalid phone or password. Please try again.");return;}
    onLogin(u.id);
  };

  const attemptRegister=()=>{
    setErr("");
    if(!f.name||!f.phone||!f.pw){setErr("All fields are required.");return;}
    if(f.phone.length<10){setErr("Please enter a valid phone number.");return;}
    if(Object.values(DB.users).find(u=>u.phone===f.phone)){setErr("This number is already registered.");return;}
    if(!f.ref){setErr("A referral code is required to join RefPay.");return;}
    const ref=Object.values(DB.users).find(u=>u.referralCode===f.ref.toUpperCase());
    if(!ref){setErr("Invalid referral code. Please check and try again.");return;}
    if(!ref.depositDone&&ref.role!=="admin"){setErr("This referral code is not yet active. Referrer must complete deposit first.");return;}
    setShowAgreement(true);
  };

  const completeRegister=()=>{
    const ref=Object.values(DB.users).find(u=>u.referralCode===f.ref.toUpperCase());
    const id=uid();
    const code=mkCode(f.name);
    DB.users[id]={
      id,name:f.name,phone:f.phone,password:f.pw,role:"user",
      balance:0,totalEarned:0,referralCode:code,
      referredBy:f.ref.toUpperCase(),referrerId:ref.id,
      depositDone:false,canRefer:false,
      joinDate:new Date().toLocaleDateString("en-GB"),
      transactions:[],withdrawals:[],
      agreedToTerms:true,agreedAt:new Date().toISOString(),
    };
    toast("Account created! Complete your deposit to activate.","success");
    onLogin(id);
  };

  if(showAgreement) return <Agreement name={f.name} onAccept={completeRegister}/>;

  return(
    <div style={{minHeight:"100vh",background:"#050508",position:"relative",overflow:"hidden"}}>
      <Particles/>
      <WithdrawTicker/>
      <div style={{position:"relative",zIndex:1}}>
        <div style={{background:"radial-gradient(ellipse 150% 70% at 50% 0%,#1e0a4e 0%,transparent 70%)",padding:"40px 20px 24px",textAlign:"center"}}>
          <Logo size={1}/>
          <div style={{marginTop:20,fontFamily:"'Outfit',sans-serif",fontSize:28,fontWeight:900,color:"#fff",lineHeight:1.2,letterSpacing:-0.5}}>
            Earn From Anywhere.<br/>
            <span style={{background:"linear-gradient(135deg,#c4b5fd,#b48408)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Get Paid Instantly.</span>
          </div>
          <div style={{fontSize:12,color:"#2a2a4a",marginTop:8,lineHeight:1.7}}>
            Join thousands earning through our referral network.<br/>PKR 250 – PKR 2,500 per successful referral.
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:14,flexWrap:"wrap"}}>
            {["🔒 Secure","⚡ Instant","🌍 Global","✦ Verified"].map((v,i)=>(
              <div key={i} style={{background:"#0c0c18",border:"1px solid #16162a",borderRadius:20,padding:"4px 11px",fontSize:10,fontWeight:700,color:"#3a3a5a",letterSpacing:.5}}>{v}</div>
            ))}
          </div>
        </div>

        <StatsBar/>

        <div style={{padding:"0 18px 48px"}}>
          <div style={{display:"flex",background:"#0c0c18",border:"1px solid #16162a",borderRadius:14,padding:4,marginBottom:18}}>
            {["login","register"].map(t=>(
              <button key={t} onClick={()=>{setTab(t);setErr("");}} style={{flex:1,padding:"11px 0",borderRadius:11,background:tab===t?"linear-gradient(135deg,#5b21b6,#7c3aed)":"transparent",color:tab===t?"#fff":"#2a2a4a",border:"none",fontWeight:800,fontSize:12,cursor:"pointer",letterSpacing:.5,transition:"all .2s"}}>
                {t==="login"?"Sign In":"Create Account"}
              </button>
            ))}
          </div>

          <Card glow s={{padding:22,animation:"fadeUp .4s ease",marginBottom:14}}>
            {tab==="register"&&<Inp label="Full Name" value={f.name} onChange={set("name")} placeholder="John Smith" required/>}
            <Inp label="Phone Number" value={f.phone} onChange={set("phone")} placeholder="+923XXXXXXXXX" type="tel" required/>
            <Inp label="Password" value={f.pw} onChange={set("pw")} placeholder="Create a strong password" type="password" required/>
            {tab==="register"&&<Inp label="Referral Code" value={f.ref} onChange={set("ref")} placeholder="Enter referral code" hint="⚠ A valid referral code is mandatory to join" required/>}
            {err&&<div style={{background:"#150606",border:"1px solid #7f1d1d33",borderRadius:11,padding:"11px 14px",color:"#f87171",fontSize:12,marginBottom:14,fontWeight:600}}>{err}</div>}
            <Btn ch={tab==="login"?"Sign In to RefPay →":"Continue to Agreement →"} onClick={tab==="login"?login:attemptRegister}/>
            {tab==="register"&&<div style={{fontSize:10,color:"#2a2a3a",textAlign:"center",marginTop:10}}>Registration requires reading & accepting our User Agreement</div>}
          </Card>

          <RoadMap/>
          <EligibilityInfo/>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
            {[["10K+","Active Members"],["PKR 2.5M+","Paid Out"],["99.8%","Uptime"]].map(([v,l])=>(
              <div key={l} style={{background:"#0c0c18",border:"1px solid #16162a",borderRadius:14,padding:"13px 10px",textAlign:"center"}}>
                <div style={{fontFamily:"'Outfit',sans-serif",fontSize:16,fontWeight:900,color:"#a78bfa",animation:"neon 3s ease-in-out infinite"}}>{v}</div>
                <div style={{fontSize:9,color:"#2a2a4a",marginTop:3,lineHeight:1.3,fontWeight:600}}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{background:"linear-gradient(135deg,#0a0800,#110f00)",border:"1px solid #b4840833",borderRadius:20,padding:18,boxShadow:"0 0 40px #b408081a",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:14}}>
              <span style={{fontSize:18,animation:"float 2.5s ease-in-out infinite"}}>👑</span>
              <div style={{fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:900,background:"linear-gradient(135deg,#c8a84b,#fde68a)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Investment Plans</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {PLANS.map(p=>(
                <div key={p.amount} style={{background:"linear-gradient(135deg,#0d0900,#080600)",border:"1px solid #b4840822",borderRadius:13,padding:"13px 12px",borderLeft:`2px solid ${p.color}55`}}>
                  <div style={{fontSize:16,marginBottom:4}}>{p.icon}</div>
                  <div style={{fontWeight:800,fontSize:12,color:p.color}}>{p.label}</div>
                  <div style={{fontSize:10,color:"#4a3a1a",marginTop:1}}>PKR {p.amount.toLocaleString()}</div>
                  <div style={{fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:900,color:"#f5e070",marginTop:6}}>+PKR {p.split.toLocaleString()}</div>
                  <div style={{fontSize:9,color:"#3a2a10",marginTop:1}}>≈ ${toUSD(p.split)}/referral</div>
                </div>
              ))}
            </div>
          </div>

          <RankingSystem/>
        </div>
      </div>
    </div>
  );
}

function Deposit({userId,onBack,onDone,toast}){
  const user=DB.users[userId];
  const [sel,setSel]=useState(1000);
  const [txn,setTxn]=useState("");
  const [method,setMethod]=useState("easypaisa");
  const plan=getPlan(sel);
  const ep=DB.settings.adminEasypaisa;

  const submit=()=>{
    if(!txn.trim()){toast("Transaction reference is required","error");return;}
    DB.transactions.push({id:tid(),userId,userName:user.name,userPhone:user.phone,amount:plan.amount,planLabel:plan.label,planIcon:plan.icon,planColor:plan.color,method,txnId:txn.trim(),adminShare:plan.split,referrerShare:plan.split,referrerId:user.referrerId||null,referrerCode:user.referredBy||null,date:new Date().toLocaleDateString("en-GB"),timestamp:Date.now(),status:"pending"});
    toast("Deposit submitted! Admin will verify within 24 hours.","success");
    onDone();
  };

  return(
    <div style={{background:"#050508",minHeight:"100vh",position:"relative",overflow:"hidden"}}>
      <Particles/>
      <WithdrawTicker/>
      <div style={{position:"relative",zIndex:1,padding:18,paddingBottom:48,animation:"fadeUp .3s ease"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
          <button onClick={onBack} style={{background:"#0c0c18",border:"1px solid #16162a",color:"#3a3a5a",borderRadius:10,padding:"9px 14px",cursor:"pointer",fontSize:17}}>←</button>
          <div>
            <div style={{fontFamily:"'Outfit',sans-serif",fontSize:20,fontWeight:900,color:"#fff"}}>Select Investment Plan</div>
            <div style={{fontSize:11,color:"#2a2a4a"}}>50/50 split — you & your referrer both earn equally</div>
          </div>
        </div>

        {PLANS.map(p=>{
          const isSel=sel===p.amount;
          return(
            <div key={p.amount} onClick={()=>setSel(p.amount)} style={{background:isSel?`linear-gradient(135deg,${p.color}10,${p.color}05)`:"#0c0c18",border:`${isSel?2:1}px solid ${isSel?p.color:p.color+"15"}`,borderRadius:16,padding:"14px 15px",marginBottom:8,cursor:"pointer",transition:"all .2s",boxShadow:isSel?`0 0 28px ${p.color}18`:"none"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:11}}>
                  <div style={{width:44,height:44,borderRadius:12,background:isSel?p.color+"20":"#080810",border:`1.5px solid ${p.color}${isSel?"66":"18"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{p.icon}</div>
                  <div>
                    <div style={{fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:900,color:isSel?p.color:"#3a3a5a"}}>{p.label}</div>
                    <div style={{fontSize:10,color:"#2a2a4a"}}>{p.desc}</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"'Outfit',sans-serif",fontSize:17,fontWeight:900,color:p.color}}>+{p.split.toLocaleString()}</div>
                  <div style={{fontSize:9,color:"#2a2a4a",fontWeight:600}}>PKR/REFERRAL</div>
                </div>
              </div>
              {isSel&&(
                <div style={{marginTop:11,display:"flex",gap:6,animation:"fadeIn .2s ease"}}>
                  {[["You Invest",plan.amount,"#e8e8ff"],["You Earn",plan.split,p.color],["Platform",plan.split,"#b48408"]].map(([l,v,c])=>(
                    <div key={l} style={{flex:1,background:"#050508",borderRadius:9,padding:"9px 0",textAlign:"center",border:`1px solid ${c}18`}}>
                      <div style={{fontFamily:"'Outfit',sans-serif",fontSize:13,fontWeight:900,color:c}}>{v.toLocaleString()}</div>
                      <div style={{fontSize:9,color:"#2a2a4a",marginTop:2,fontWeight:600}}>{l.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <Card s={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,color:"#3a3a5a",letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>Payment Method</div>
          {[{id:"easypaisa",l:"EasyPaisa",icon:"💚",c:"#22c55e"},{id:"jazzcash",l:"JazzCash",icon:"🔴",c:"#ec4899"}].map(m=>(
            <div key={m.id} onClick={()=>setMethod(m.id)} style={{display:"flex",alignItems:"center",gap:11,padding:"12px 13px",borderRadius:12,marginBottom:7,cursor:"pointer",border:`1.5px solid ${method===m.id?m.c:"#16162a"}`,background:method===m.id?m.c+"0c":"transparent",transition:"all .2s"}}>
              <span style={{fontSize:20}}>{m.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:13,color:method===m.id?m.c:"#3a3a5a"}}>{m.l}</div>
                <div style={{fontSize:11,color:"#2a2a4a"}}>{ep}</div>
              </div>
              <div style={{width:18,height:18,borderRadius:9,border:`2px solid ${method===m.id?m.c:"#2a2a4a"}`,background:method===m.id?m.c:"transparent"}}/>
            </div>
          ))}
        </Card>

        <div style={{background:"#08081a",border:"1px solid #6d28d920",borderRadius:14,padding:14,marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:"#6d28d9",marginBottom:9,letterSpacing:.5}}>PAYMENT INSTRUCTIONS</div>
          <div style={{fontSize:12,color:"#3a3a6a",lineHeight:2.1}}>
            1. Send <b style={{color:plan.color}}>PKR {plan.amount.toLocaleString()}</b> to <b style={{color:"#e8e8ff"}}>{ep}</b> via {method==="easypaisa"?"EasyPaisa":"JazzCash"}<br/>
            2. Copy your transaction reference number<br/>
            3. Paste below and submit for verification<br/>
            4. Admin verifies within <b style={{color:"#a78bfa"}}>1–24 hours</b>
          </div>
        </div>

        <Inp label="Transaction Reference / ID" value={txn} onChange={setTxn} placeholder="e.g. EP9876543210" required/>
        <Btn ch={`${plan.icon} Confirm PKR ${plan.amount.toLocaleString()} Deposit`} v="primary" onClick={submit} disabled={!txn.trim()}/>
        <div style={{textAlign:"center",fontSize:10,color:"#1a1a2a",marginTop:10,letterSpacing:.5,fontWeight:600}}>🔒 SECURED & ENCRYPTED · VERIFIED BY REFPAY</div>
      </div>
    </div>
  );
}

function Withdraw({userId,onBack,toast,refresh}){
  const user=DB.users[userId];
  const [amt,setAmt]=useState("");
  const [method,setMethod]=useState("easypaisa");
  const [acc,setAcc]=useState("");
  const [name,setName]=useState("");
  const n=parseInt(amt)||0;

  const submit=()=>{
    if(n<MIN_WITHDRAW){toast(`Minimum withdrawal is PKR ${MIN_WITHDRAW}`,"error");return;}
    if(n>user.balance){toast("Insufficient balance","error");return;}
    if(!acc||!name){toast("Account details are required","error");return;}
    DB.users[userId].balance-=n;
    const w={id:tid(),userId,userName:user.name,amount:n,fee:0,youGet:n,method,accNumber:acc,accName:name,date:new Date().toLocaleDateString("en-GB"),status:"pending"};
    DB.withdrawals.push(w);
    if(!DB.users[userId].withdrawals)DB.users[userId].withdrawals=[];
    DB.users[userId].withdrawals.push(w);
    toast(`Withdrawal of PKR ${n.toLocaleString()} submitted!`,"success");
    refresh();onBack();
  };

  return(
    <div style={{background:"#050508",minHeight:"100vh",position:"relative",overflow:"hidden"}}>
      <Particles/>
      <div style={{position:"relative",zIndex:1,padding:18,paddingBottom:48,animation:"fadeUp .3s ease"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
          <button onClick={onBack} style={{background:"#0c0c18",border:"1px solid #16162a",color:"#3a3a5a",borderRadius:10,padding:"9px 14px",cursor:"pointer",fontSize:17}}>←</button>
          <div>
            <div style={{fontFamily:"'Outfit',sans-serif",fontSize:20,fontWeight:900,color:"#fff"}}>Withdraw Earnings</div>
            <div style={{fontSize:11,color:"#2a2a4a"}}>Zero fees — 100% of your earnings transferred</div>
          </div>
        </div>

        <div style={{background:"linear-gradient(135deg,#1a0a3e,#0c0c18)",border:"1px solid #6d28d930",borderRadius:20,padding:22,marginBottom:14,textAlign:"center",animation:"glow 4s ease-in-out infinite"}}>
          <div style={{fontSize:10,fontWeight:700,color:"#2a2a4a",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Available Balance</div>
          <div style={{fontFamily:"'Outfit',sans-serif",fontSize:38,fontWeight:900,color:"#a78bfa",letterSpacing:-1,lineHeight:1,animation:"neon 3s ease-in-out infinite"}}>PKR {user.balance.toLocaleString()}</div>
          <div style={{fontSize:12,color:"#2a2a4a",marginTop:4}}>≈ ${toUSD(user.balance)} USD</div>
        </div>

        <Card s={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,color:"#3a3a5a",letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>Withdrawal Amount</div>
          <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
            {[500,1000,2000,5000].map(a=>(
              <button key={a} onClick={()=>setAmt(String(a))} style={{flex:1,minWidth:55,padding:"9px 0",borderRadius:9,background:amt===String(a)?"linear-gradient(135deg,#5b21b6,#7c3aed)":"#080810",color:amt===String(a)?"#fff":"#2a2a4a",border:`1px solid ${amt===String(a)?"transparent":"#16162a"}`,fontWeight:800,fontSize:12,cursor:"pointer"}}>₨{a}</button>
            ))}
          </div>
          <Inp value={amt} onChange={setAmt} type="number" placeholder="Or enter custom amount"/>
        </Card>

        <Card s={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,color:"#3a3a5a",letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>Payout Method</div>
          {[{id:"easypaisa",l:"EasyPaisa",icon:"💚",c:"#22c55e"},{id:"jazzcash",l:"JazzCash",icon:"🔴",c:"#ec4899"}].map(m=>(
            <div key={m.id} onClick={()=>setMethod(m.id)} style={{display:"flex",alignItems:"center",gap:11,padding:"12px 13px",borderRadius:12,marginBottom:7,cursor:"pointer",border:`1.5px solid ${method===m.id?m.c:"#16162a"}`,background:method===m.id?m.c+"0c":"transparent",transition:"all .2s"}}>
              <span style={{fontSize:20}}>{m.icon}</span>
              <div style={{flex:1,fontWeight:800,fontSize:13,color:method===m.id?m.c:"#3a3a5a"}}>{m.l}</div>
              <div style={{width:18,height:18,borderRadius:9,border:`2px solid ${method===m.id?m.c:"#2a2a4a"}`,background:method===m.id?m.c:"transparent"}}/>
            </div>
          ))}
        </Card>

        <Card s={{marginBottom:16}}>
          <Inp label="Account Number / Phone" value={acc} onChange={setAcc} placeholder="+923XXXXXXXXX" type="tel" required/>
          <Inp label="Account Holder Name" value={name} onChange={setName} placeholder="Full name as registered" required/>
        </Card>

        <Btn ch={`Withdraw PKR ${n>=MIN_WITHDRAW?n.toLocaleString():"---"} →`} v="primary" onClick={submit} disabled={n<MIN_WITHDRAW||!acc||!name}/>
        <div style={{textAlign:"center",fontSize:10,color:"#1a1a2a",marginTop:10,letterSpacing:.5,fontWeight:600}}>Processed within 1–24 hours · 🔒 Secure</div>
      </div>
    </div>
  );
}

function AnnouncementsBox(){
  return(
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
        <div style={{fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:900,color:"#fff"}}>Announcements</div>
        <Badge l="● Live" c="#22c55e"/>
      </div>
      {DB.announcements.map(a=>(
        <div key={a.id} style={{background:`linear-gradient(135deg,${a.color}0a,#0c0c18)`,border:`1px solid ${a.color}22`,borderRadius:14,padding:14,marginBottom:8,display:"flex",gap:12,alignItems:"flex-start"}}>
          <div style={{width:40,height:40,borderRadius:11,background:a.color+"20",border:`1px solid ${a.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,animation:"float 3s ease-in-out infinite"}}>
            {a.type==="gift"?"🎁":"🚀"}
          </div>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:13,color:a.color,marginBottom:4}}>{a.title}</div>
            <div style={{fontSize:11,color:"#2a2a4a",lineHeight:1.6,marginBottom:6}}>{a.desc}</div>
            <div style={{display:"inline-flex",alignItems:"center",gap:5,background:a.color+"12",border:`1px solid ${a.color}20`,borderRadius:20,padding:"3px 10px"}}>
              <span style={{fontSize:9,fontWeight:700,color:a.color}}>📅 {a.date}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TasksScreen({userId,onBack,toast,refresh}){
  const user=DB.users[userId];
  const [activeTask,setActiveTask]=useState(null);
  const [sub,setSub]=useState("");
  const mySubmissions=DB.taskSubmissions.filter(s=>s.userId===userId);
  const activeTasks=DB.tasks.filter(t=>t.status==="active");

  const submit=(taskId)=>{
    if(!sub.trim()){toast("Please provide your submission link or details","error");return;}
    const task=DB.tasks.find(t=>t.id===taskId);
    if(!task)return;
    if(DB.taskSubmissions.find(s=>s.userId===userId&&s.taskId===taskId)){toast("You already submitted this task","error");return;}
    DB.taskSubmissions.push({id:tid(),userId,userName:user.name,userPhone:user.phone,taskId,taskTitle:task.title,taskCommission:task.commission,submission:sub.trim(),date:new Date().toLocaleDateString("en-GB"),timestamp:Date.now(),status:"pending"});
    toast("Task submitted! Review within 24 hours.","success");
    setSub("");setActiveTask(null);refresh();
  };

  return(
    <div style={{background:"#050508",minHeight:"100vh",position:"relative",overflow:"hidden"}}>
      <Particles/>
      <div style={{position:"relative",zIndex:1,padding:18,paddingBottom:48,animation:"fadeUp .3s ease"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
          <button onClick={onBack} style={{background:"#0c0c18",border:"1px solid #16162a",color:"#3a3a5a",borderRadius:10,padding:"9px 14px",cursor:"pointer",fontSize:17}}>←</button>
          <div>
            <div style={{fontFamily:"'Outfit',sans-serif",fontSize:20,fontWeight:900,color:"#fff"}}>Task Center</div>
            <div style={{fontSize:11,color:"#2a2a4a"}}>Complete tasks & earn commissions</div>
          </div>
        </div>

        {activeTasks.length===0?(
          <Card s={{textAlign:"center",padding:44}}>
            <div style={{fontSize:44,marginBottom:14,animation:"float 2s ease-in-out infinite"}}>🎯</div>
            <div style={{fontFamily:"'Outfit',sans-serif",fontSize:17,color:"#2a2a4a",marginBottom:6,fontWeight:800}}>No Active Tasks</div>
            <div style={{fontSize:12,color:"#1a1a2a"}}>New tasks will appear here. Check back soon!</div>
          </Card>
        ):(
          activeTasks.map(task=>{
            const mySub=mySubmissions.find(s=>s.taskId===task.id);
            const isActive=activeTask===task.id;
            return(
              <Card key={task.id} glow={isActive} color="#a78bfa" s={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div style={{flex:1,marginRight:12}}>
                    <div style={{fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:900,color:"#fff",marginBottom:4}}>{task.title}</div>
                    <div style={{fontSize:11,color:"#2a2a4a",lineHeight:1.6}}>{task.description}</div>
                  </div>
                  <div style={{textAlign:"center",flexShrink:0}}>
                    <div style={{fontFamily:"'Outfit',sans-serif",fontSize:20,fontWeight:900,color:"#b48408",lineHeight:1}}>{task.commission.toLocaleString()}</div>
                    <div style={{fontSize:9,color:"#2a2a4a",fontWeight:600}}>PKR</div>
                  </div>
                </div>
                {mySub?(
                  <div style={{background:mySub.status==="approved"?"#0a1f0d":mySub.status==="rejected"?"#150606":"#121000",border:`1px solid ${mySub.status==="approved"?"#22c55e22":mySub.status==="rejected"?"#7f1d1d":"#b4840822"}`,borderRadius:11,padding:"10px 14px"}}>
                    <div style={{fontSize:13,fontWeight:800,color:mySub.status==="approved"?"#22c55e":mySub.status==="rejected"?"#ef4444":"#b48408"}}>
                      {mySub.status==="approved"?"✦ Approved!":mySub.status==="rejected"?"✕ Rejected":"⏳ Under Review..."}
                    </div>
                  </div>
                ):isActive?(
                  <div style={{animation:"fadeIn .2s ease"}}>
                    <Inp label="Submission Link or Details" value={sub} onChange={setSub} placeholder="YouTube / Google Drive link..." rows={3}/>
                    <div style={{display:"flex",gap:7}}>
                      <Btn ch="Submit ✦" v="primary" onClick={()=>submit(task.id)} disabled={!sub.trim()}/>
                      <Btn ch="Cancel" v="dark" onClick={()=>setActiveTask(null)} s={{flex:"0 0 90px"}}/>
                    </div>
                  </div>
                ):(
                  <Btn ch="Accept Task →" v="ghost" onClick={()=>setActiveTask(task.id)}/>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

function UserDash({userId,onLogout,onDeposit,onWithdraw,onTasks,toast}){
  const user=DB.users[userId];
  if(!user)return null;
  const refs=Object.values(DB.users).filter(u=>u.referrerId===userId);
  const activeRefs=refs.filter(u=>u.depositDone);
  const pendingDep=DB.transactions.find(t=>t.userId===userId&&t.status==="pending");
  const approvedDep=DB.transactions.find(t=>t.userId===userId&&t.status==="approved");
  const myPlan=approvedDep?getPlan(approvedDep.amount):null;
  const activeTasks=DB.tasks.filter(t=>t.status==="active").length;
  const myRank=()=>{
    const r=activeRefs.length;
    if(r>=1000)return{label:"🏆 Legend",color:"#fde68a"};
    if(r>=500)return{label:"💠 Diamond",color:"#7dd3fc"};
    if(r>=100)return{label:"👑 Gold",color:"#f5c842"};
    if(r>=50)return{label:"🥈 Silver",color:"#94a3b8"};
    if(r>=10)return{label:"🥉 Bronze",color:"#c8a84b"};
    return{label:"⚡ Starter",color:"#a78bfa"};
  };
  const rank=myRank();

  const copyCode=()=>{
    navigator.clipboard?.writeText(user.referralCode).catch(()=>{});
    toast("Referral code copied!","success");
  };

  return(
    <div style={{background:"#050508",minHeight:"100vh",position:"relative",overflow:"hidden"}}>
      <Particles/>
      <WithdrawTicker/>
      <div style={{position:"relative",zIndex:1,padding:"16px 16px 48px",animation:"fadeUp .35s ease"}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <Logo/>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <div style={{background:"#0c0c18",border:"1px solid #16162a",borderRadius:9,padding:"5px 10px",fontSize:11,color:"#3a3a5a",fontWeight:600}}>{user.name.split(" ")[0]}</div>
            <button onClick={onLogout} style={{background:"#0c0c18",border:"1px solid #16162a",color:"#3a3a5a",borderRadius:9,padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:600}}>Sign Out</button>
          </div>
        </div>

        <StatsBar/>

        {!user.depositDone&&(
          <div style={{background:"linear-gradient(135deg,#1a0606,#0c0c18)",border:"1px solid #7f1d1d33",borderRadius:16,padding:16,marginBottom:14}}>
            <div style={{fontFamily:"'Outfit',sans-serif",fontSize:16,fontWeight:900,color:"#ef4444",marginBottom:6}}>⚡ Account Not Activated</div>
            {pendingDep
              ?<div style={{fontSize:12,color:"#2a2a4a"}}>Your deposit is under review. Admin will verify within 24 hours.</div>
              :<><div style={{fontSize:12,color:"#2a2a4a",marginBottom:12}}>Select an investment plan to activate your account.</div><Btn ch="View Investment Plans →" v="primary" onClick={onDeposit} s={{padding:"12px 0"}}/></>
            }
          </div>
        )}

        <div style={{background:"linear-gradient(135deg,#1a0a3e,#0c0c18,#0a0a20)",border:"1px solid #6d28d930",borderRadius:22,padding:"24px 20px",marginBottom:14,position:"relative",overflow:"hidden",animation:"glow 4s ease-in-out infinite"}}>
          <div style={{position:"absolute",top:-20,right:-20,fontSize:100,opacity:.015,pointerEvents:"none"}}>💸</div>
          {myPlan&&(
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:myPlan.color+"15",border:`1px solid ${myPlan.color}30`,borderRadius:20,padding:"4px 12px",marginBottom:14,fontSize:10,fontWeight:800,color:myPlan.color,letterSpacing:.5}}>
              {myPlan.icon} {myPlan.label.toUpperCase()} MEMBER
            </div>
          )}
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:rank.color+"15",border:`1px solid ${rank.color}30`,borderRadius:20,padding:"4px 12px",marginBottom:14,marginLeft:8,fontSize:10,fontWeight:800,color:rank.color,letterSpacing:.5}}>
            {rank.label}
          </div>
          <div style={{fontSize:10,fontWeight:700,color:"#2a2a4a",letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Total Balance</div>
          <div style={{fontFamily:"'Outfit',sans-serif",fontSize:40,fontWeight:900,color:"#a78bfa",letterSpacing:-2,lineHeight:1,animation:"neon 3s ease-in-out infinite"}}>PKR {user.balance.toLocaleString()}</div>
          <div style={{fontSize:11,color:"#2a2a4a",marginTop:4}}>≈ ${toUSD(user.balance)} USD</div>
          <div style={{display:"flex",gap:20,marginTop:16}}>
            {[{l:"Referrals",v:activeRefs.length,c:"#b48408"},{l:"Total Earned",v:`₨${user.totalEarned.toLocaleString()}`,c:"#a78bfa"},{l:"Status",v:user.depositDone?"Active":"Inactive",c:user.depositDone?"#22c55e":"#ef4444"}].map(s=>(
              <div key={s.l}>
                <div style={{fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:900,color:s.c}}>{s.v}</div>
                <div style={{fontSize:9,color:"#1a1a2a",marginTop:2,letterSpacing:.5,fontWeight:600}}>{s.l.toUpperCase()}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:7,marginTop:16}}>
            <button onClick={onDeposit} style={{flex:1,background:"#0c0c18",border:"1px solid #6d28d930",borderRadius:11,padding:"11px 0",fontWeight:800,fontSize:11,color:"#a78bfa",cursor:"pointer",letterSpacing:.5}}>+ DEPOSIT</button>
            <button onClick={onWithdraw} disabled={!user.depositDone||user.balance<MIN_WITHDRAW} style={{flex:1,background:user.depositDone&&user.balance>=MIN_WITHDRAW?"linear-gradient(135deg,#5b21b6,#7c3aed)":"#0c0c18",border:"none",borderRadius:11,padding:"11px 0",fontWeight:800,fontSize:11,color:user.depositDone&&user.balance>=MIN_WITHDRAW?"#fff":"#1a1a2a",cursor:user.depositDone&&user.balance>=MIN_WITHDRAW?"pointer":"not-allowed",letterSpacing:.5}}>WITHDRAW</button>
          </div>
        </div>

        <div onClick={onTasks} style={{background:"linear-gradient(135deg,#1a0a3e,#0c0c18)",border:"1px solid #6d28d928",borderRadius:15,padding:14,marginBottom:14,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:46,height:46,borderRadius:13,background:"#6d28d918",border:"1.5px solid #6d28d940",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,animation:"float 2.5s ease-in-out infinite"}}>🎯</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:900,color:"#a78bfa"}}>Task Center</div>
            <div style={{fontSize:11,color:"#2a2a4a",marginTop:2}}>{activeTasks>0?`${activeTasks} task(s) available — earn extra!`:"Stay tuned for new tasks"}</div>
          </div>
          <div style={{color:"#6d28d9",fontSize:18,fontWeight:900}}>→</div>
        </div>

        {user.depositDone?(
          <Card glow s={{marginBottom:14}}>
            <div style={{fontSize:10,fontWeight:700,color:"#3a3a5a",letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>Your Referral Code</div>
            <div style={{display:"flex",gap:9,alignItems:"center",marginBottom:10}}>
              <div style={{flex:1,background:"#050508",borderRadius:12,padding:"14px 0",textAlign:"center",border:"1.5px dashed #6d28d930",fontFamily:"'Outfit',sans-serif",fontSize:22,fontWeight:900,letterSpacing:7,color:"#a78bfa"}}>{user.referralCode}</div>
              <button onClick={copyCode} style={{background:"linear-gradient(135deg,#5b21b6,#7c3aed)",color:"#fff",border:"none",borderRadius:12,padding:"14px 14px",fontWeight:800,cursor:"pointer",fontSize:12,letterSpacing:.5}}>Copy</button>
            </div>
            <div style={{fontSize:11,color:"#2a2a4a",textAlign:"center"}}>
              Earn PKR {myPlan?myPlan.split.toLocaleString():"250–2,500"} for every successful referral
            </div>
          </Card>
        ):(
          <div style={{background:"#0c0c18",border:"1px solid #16162a",borderRadius:16,padding:16,marginBottom:14,opacity:.5}}>
            <div style={{fontSize:12,color:"#ef4444",fontWeight:700}}>🔒 Referral code unlocks after deposit approval</div>
          </div>
        )}

        <RoadMap/>
        <EligibilityInfo/>
        <RankingSystem/>
        <AnnouncementsBox/>

        <div style={{background:"linear-gradient(135deg,#0a0800,#0c0b00)",border:"1px solid #b4840830",borderRadius:18,padding:16,marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:13}}>
            <span style={{fontSize:16,animation:"float 2.5s ease-in-out infinite"}}>👑</span>
            <div style={{fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:900,background:"linear-gradient(135deg,#c8a84b,#fde68a)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Investment Plans</div>
          </div>
          {PLANS.map(p=>(
            <div key={p.amount} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 13px",borderRadius:11,marginBottom:6,background:"#0a0900",border:"1px solid #b4840818",borderLeft:`2px solid ${p.color}55`}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <div style={{width:32,height:32,borderRadius:9,background:p.color+"12",border:`1px solid ${p.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{p.icon}</div>
                <div>
                  <div style={{fontWeight:800,fontSize:12,color:p.color}}>{p.label}</div>
                  <div style={{fontSize:9,color:"#3a2a10",fontWeight:600}}>PKR {p.amount.toLocaleString()}</div>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:900,color:"#f5e070"}}>+{p.split.toLocaleString()}</div>
                <div style={{fontSize:9,color:"#3a2a10",fontWeight:600}}>≈ ${toUSD(p.split)}/ref</div>
              </div>
            </div>
          ))}
        </div>

        {refs.length>0&&(
          <Card s={{marginBottom:14}}>
            <div style={{fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:900,color:"#fff",marginBottom:12}}>My Network ({refs.length})</div>
            {refs.map(u=>{
              const dep=DB.transactions.find(t=>t.userId===u.id&&t.status==="approved");
              const p=dep?getPlan(dep.amount):null;
              return(
                <div key={u.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,paddingBottom:8,borderBottom:"1px solid #111"}}>
                  <div>
                    <div style={{fontWeight:700,color:"#bbb",fontSize:12}}>{u.name}</div>
                    <div style={{fontSize:9,color:"#1a1a2a",fontWeight:500}}>{u.joinDate}{p?` · ${p.icon} ${p.label}`:""}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <Badge l={u.depositDone?"Active":"Pending"} c={u.depositDone?"#22c55e":"#b48408"}/>
                    {dep&&<div style={{fontSize:11,color:"#b48408",fontWeight:800,marginTop:3}}>+PKR {dep.referrerShare.toLocaleString()}</div>}
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </div>
    </div>
  );
}

function AdminPanel({onLogout,toast}){
  const [tab,setTab]=useState("deposits");
  const [ep,setEp]=useState(DB.settings.adminEasypaisa);
  const [tick,setTick]=useState(0);
  const refresh=()=>setTick(t=>t+1);
  const [nt,setNt]=useState({title:"",desc:"",cat:"Video Editing",commission:"",deadline:"",req:""});
  const snt=k=>v=>setNt(p=>({...p,[k]:v}));

  const pDeps=DB.transactions.filter(t=>t.status==="pending");
  const aDeps=DB.transactions.filter(t=>t.status==="approved");
  const pW=DB.withdrawals.filter(w=>w.status==="pending");
  const pSubs=DB.taskSubmissions.filter(s=>s.status==="pending");
  const users=Object.values(DB.users).filter(u=>u.role!=="admin");
  const totalAdmin=aDeps.reduce((s,t)=>s+t.adminShare,0);
  const totalRef=aDeps.reduce((s,t)=>s+t.referrerShare,0);
  const totalReg=users.length;
  const totalActive=users.filter(u=>u.depositDone).length;

  const appD=id=>{
    const t=DB.transactions.find(x=>x.id===id);if(!t)return;
    t.status="approved";
    if(DB.users[t.userId]){DB.users[t.userId].depositDone=true;DB.users[t.userId].canRefer=true;}
    if(t.referrerId&&DB.users[t.referrerId]){
      DB.users[t.referrerId].balance+=t.referrerShare;
      DB.users[t.referrerId].totalEarned+=t.referrerShare;
      DB.users[t.referrerId].transactions.unshift({id:tid(),amount:t.referrerShare,desc:`${t.planIcon} ${t.planLabel} referral — ${t.userName}`,date:new Date().toLocaleDateString("en-GB")});
    }
    DB.users.ADMIN.balance+=t.adminShare;DB.users.ADMIN.totalEarned+=t.adminShare;
    toast(`Approved! Platform earned PKR ${t.adminShare.toLocaleString()}`,"success");refresh();
  };
  const rejD=id=>{const t=DB.transactions.find(x=>x.id===id);if(t)t.status="rejected";toast("Deposit rejected","error");refresh();};
  const appW=id=>{
    const w=DB.withdrawals.find(x=>x.id===id);if(!w)return;
    w.status="approved";
    const uw=DB.users[w.userId]?.withdrawals?.find(x=>x.id===id);if(uw)uw.status="approved";
    toast(`Send PKR ${w.youGet.toLocaleString()} to ${w.accNumber}`,"success");refresh();
  };
  const rejW=id=>{
    const w=DB.withdrawals.find(x=>x.id===id);if(!w)return;
    w.status="rejected";
    if(DB.users[w.userId])DB.users[w.userId].balance+=w.amount;
    const uw=DB.users[w.userId]?.withdrawals?.find(x=>x.id===id);if(uw)uw.status="rejected";
    toast("Rejected — balance refunded","info");refresh();
  };
  const appS=id=>{
    const s=DB.taskSubmissions.find(x=>x.id===id);if(!s)return;
    s.status="approved";
    if(DB.users[s.userId]){DB.users[s.userId].balance+=s.taskCommission;DB.users[s.userId].totalEarned+=s.taskCommission;DB.users[s.userId].transactions.unshift({id:tid(),amount:s.taskCommission,desc:`🎯 Task — ${s.taskTitle}`,date:new Date().toLocaleDateString("en-GB")});}
    toast(`Task approved! PKR ${s.taskCommission.toLocaleString()} paid`,"success");refresh();
  };
  const rejS=id=>{const s=DB.taskSubmissions.find(x=>x.id===id);if(s)s.status="rejected";toast("Task rejected","error");refresh();};
  const addTask=()=>{
    if(!nt.title||!nt.commission){toast("Title and commission required","error");return;}
    DB.tasks.push({id:tid(),title:nt.title,description:nt.desc,category:nt.cat,commission:parseInt(nt.commission)||0,deadline:nt.deadline||"Open",requirements:nt.req,status:"active",date:new Date().toLocaleDateString("en-GB")});
    setNt({title:"",desc:"",cat:"Video Editing",commission:"",deadline:"",req:""});
    toast("Task posted successfully!","success");refresh();
  };

  return(
    <div style={{background:"#050508",minHeight:"100vh",position:"relative",overflow:"hidden"}}>
      <Particles/>
      <div style={{position:"relative",zIndex:1,padding:"16px 16px 48px",animation:"fadeUp .35s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <Logo/>
            <div style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:6,background:"#1a0a3e",border:"1px solid #6d28d930",borderRadius:20,padding:"3px 11px"}}>
              <span style={{fontSize:9}}>🔐</span>
              <span style={{fontSize:9,fontWeight:800,color:"#a78bfa",letterSpacing:1}}>ADMIN DASHBOARD</span>
            </div>
          </div>
          <button onClick={onLogout} style={{background:"#0c0c18",border:"1px solid #16162a",color:"#2a2a4a",borderRadius:9,padding:"7px 13px",cursor:"pointer",fontSize:11,fontWeight:700}}>Sign Out</button>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
          {[
            {l:"Platform Revenue",v:`₨${totalAdmin.toLocaleString()}`,c:"#b48408",i:"💰"},
            {l:"Paid to Members",v:`₨${totalRef.toLocaleString()}`,c:"#22c55e",i:"💸"},
            {l:"Registered",v:totalReg,c:"#a78bfa",i:"👥"},
            {l:"Active Members",v:totalActive,c:"#7dd3fc",i:"✦"},
            {l:"Pending Actions",v:pDeps.length+pW.length+pSubs.length,c:pDeps.length+pW.length+pSubs.length>0?"#ef4444":"#2a2a4a",i:"⏳"},
            {l:"Admin Code",v:"REFPAY2025",c:"#f5c842",i:"🔗"},
          ].map(s=>(
            <div key={s.l} style={{background:"#0c0c18",border:"1px solid #16162a",borderRadius:13,padding:12,borderTop:`2px solid ${s.c}`}}>
              <div style={{fontSize:9,color:"#2a2a4a",letterSpacing:.5,textTransform:"uppercase",marginBottom:4,fontWeight:700}}>{s.i} {s.l}</div>
              <div style={{fontFamily:"'Outfit',sans-serif",fontSize:16,fontWeight:900,color:s.c}}>{s.v}</div>
            </div>
          ))}
        </div>

        <div style={{background:"linear-gradient(135deg,#0c0a00,#0c0c18)",border:"1px solid #b4840830",borderRadius:14,padding:14,marginBottom:14}}>
          <div style={{fontFamily:"'Outfit',sans-serif",fontSize:12,fontWeight:900,color:"#b48408",marginBottom:9}}>⚙️ Admin Payment Number</div>
          <div style={{display:"flex",gap:7}}>
            <input value={ep} onChange={e=>setEp(e.target.value)} placeholder="03XXXXXXXXX" style={{flex:1,background:"#050508",border:"1.5px solid #b4840820",borderRadius:10,padding:"10px 13px",color:"#e8e8ff",fontSize:13,outline:"none",fontFamily:"'Outfit',sans-serif"}}/>
            <button onClick={()=>{DB.settings.adminEasypaisa=ep;toast("Saved!","success");}} style={{background:"linear-gradient(135deg,#92400e,#b48408,#d97706)",color:"#0a0600",border:"none",borderRadius:10,padding:"10px 15px",fontWeight:900,cursor:"pointer",fontSize:12}}>Save</button>
          </div>
        </div>

        <div style={{display:"flex",gap:5,marginBottom:14,overflowX:"auto",paddingBottom:3}}>
          {[
            ["deposits",`Deposits (${pDeps.length})`, "#b48408"],
            ["withdrawals",`Withdrawals (${pW.length})`, "#7dd3fc"],
            ["tasks",`Tasks (${pSubs.length})`, "#a78bfa"],
            ["newtask","+ New Task", "#22c55e"],
            ["members",`Members (${users.length})`, "#94a3b8"],
          ].map(([id,l,c])=>(
            <button key={id} onClick={()=>setTab(id)} style={{padding:"7px 12px",borderRadius:20,whiteSpace:"nowrap",flexShrink:0,background:tab===id?c+"15":"#0c0c18",color:tab===id?c:"#2a2a4a",border:`1px solid ${tab===id?c+"33":"#16162a"}`,fontWeight:700,fontSize:10,cursor:"pointer",transition:"all .2s",letterSpacing:.5}}>
              {l}
            </button>
          ))}
        </div>

        {tab==="deposits"&&(
          <div>
            {pDeps.length===0?<div style={{textAlign:"center",color:"#2a2a4a",padding:40,fontSize:12,fontWeight:600}}>No pending deposits ✦</div>:
            pDeps.map(t=>{
              const p=getPlan(t.amount);
              return(
                <Card key={t.id} glow color={p.color} s={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
                    <div style={{display:"flex",alignItems:"center",gap:9}}>
                      <div style={{width:36,height:36,borderRadius:9,background:p.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{t.planIcon}</div>
                      <div>
                        <div style={{fontWeight:800,color:"#ddd",fontSize:12}}>{t.userName}</div>
                        <div style={{fontSize:9,color:"#1a1a2a",fontWeight:600}}>{t.userPhone} · {t.date}</div>
                      </div>
                    </div>
                    <Badge l="Pending" c="#b48408"/>
                  </div>
                  <div style={{fontSize:10,color:"#1a1a2a",marginBottom:9,fontWeight:600}}>TXN: <span style={{color:"#333350"}}>{t.txnId}</span></div>
                  <div style={{display:"flex",gap:7}}>
                    <Btn ch="✦ Approve" v="primary" onClick={()=>appD(t.id)} s={{padding:"10px 0",fontSize:12}}/>
                    <Btn ch="✕ Reject" v="red" onClick={()=>rejD(t.id)} s={{padding:"10px 0",fontSize:12}}/>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {tab==="withdrawals"&&(
          <div>
            {pW.length===0?<div style={{textAlign:"center",color:"#2a2a4a",padding:40,fontSize:12,fontWeight:600}}>No pending withdrawals</div>:
            pW.map(w=>(
              <Card key={w.id} glow color="#7dd3fc" s={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:9}}>
                  <div><div style={{fontWeight:800,color:"#ddd",fontSize:12}}>{w.userName}</div><div style={{fontSize:9,color:"#1a1a2a",fontWeight:600}}>{w.date}</div></div>
                  <Badge l="Pending" c="#b48408"/>
                </div>
                <div style={{background:"#050508",borderRadius:11,padding:12,marginBottom:9}}>
                  <div style={{fontFamily:"'Outfit',sans-serif",fontSize:22,fontWeight:900,color:"#a78bfa",marginBottom:6}}>PKR {w.youGet.toLocaleString()}</div>
                  <div style={{fontSize:12,color:"#555"}}>📱 {w.method}: <b style={{color:"#e8e8ff"}}>{w.accNumber}</b></div>
                  <div style={{fontSize:10,color:"#2a2a4a",fontWeight:600}}>Account: {w.accName}</div>
                </div>
                <div style={{display:"flex",gap:7}}>
                  <Btn ch="✦ Mark Sent" v="primary" onClick={()=>appW(w.id)} s={{padding:"10px 0",fontSize:12}}/>
                  <Btn ch="✕ Reject" v="red" onClick={()=>rejW(w.id)} s={{padding:"10px 0",fontSize:12}}/>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab==="tasks"&&(
          <div>
            {DB.tasks.length>0&&(
              <div style={{marginBottom:14}}>
                <div style={{fontFamily:"'Outfit',sans-serif",fontSize:13,fontWeight:900,color:"#fff",marginBottom:9}}>Posted Tasks</div>
                {DB.tasks.map(t=>(
                  <div key={t.id} style={{background:"#0c0c18",border:`1px solid ${t.status==="active"?"#a78bfa20":"#16162a"}`,borderRadius:12,padding:11,marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontWeight:700,color:"#ccc",fontSize:12}}>{t.title}</div>
                      <div style={{fontSize:9,color:"#1a1a2a",fontWeight:600}}>PKR {t.commission.toLocaleString()} · {DB.taskSubmissions.filter(s=>s.taskId===t.id).length} submissions</div>
                    </div>
                    <button onClick={()=>{const x=DB.tasks.find(x=>x.id===t.id);if(x){x.status=x.status==="active"?"closed":"active";}refresh();}} style={{background:t.status==="active"?"#0a1f0d":"#150606",border:`1px solid ${t.status==="active"?"#22c55e18":"#7f1d1d18"}`,borderRadius:20,padding:"4px 10px",color:t.status==="active"?"#22c55e":"#ef4444",fontWeight:700,fontSize:9,cursor:"pointer"}}>{t.status==="active"?"Active":"Closed"}</button>
                  </div>
                ))}
              </div>
            )}
            {pSubs.length===0?<div style={{textAlign:"center",color:"#2a2a4a",padding:36,fontSize:12,fontWeight:600}}>No pending submissions</div>:
            pSubs.map(s=>(
              <Card key={s.id} glow color="#a78bfa" s={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:9}}>
                  <div><div style={{fontWeight:800,color:"#ddd",fontSize:12}}>{s.userName}</div><div style={{fontSize:9,color:"#1a1a2a",fontWeight:600}}>{s.date}</div></div>
                  <Badge l="Review" c="#b48408"/>
                </div>
                <div style={{background:"#050508",borderRadius:11,padding:11,marginBottom:9}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#a78bfa",marginBottom:4}}>🎯 {s.taskTitle}</div>
                  <div style={{fontSize:11,color:"#555",wordBreak:"break-all"}}>{s.submission}</div>
                  <div style={{fontFamily:"'Outfit',sans-serif",fontSize:16,fontWeight:900,color:"#b48408",marginTop:7}}>PKR {s.taskCommission.toLocaleString()}</div>
                </div>
                <div style={{display:"flex",gap:7}}>
                  <Btn ch="✦ Approve" v="green" onClick={()=>appS(s.id)} s={{padding:"10px 0",fontSize:12}}/>
                  <Btn ch="✕ Reject" v="red" onClick={()=>rejS(s.id)} s={{padding:"10px 0",fontSize:12}}/>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab==="newtask"&&(
          <Card glow color="#22c55e">
            <div style={{fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:900,color:"#fff",marginBottom:16}}>Post New Task</div>
            <Inp label="Task Title" value={nt.title} onChange={snt("title")} placeholder="e.g. Create a Travel Vlog Video" required/>
            <Inp label="Description" value={nt.desc} onChange={snt("desc")} placeholder="Detailed task requirements..." rows={3}/>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,color:"#3a3a5a",marginBottom:6,letterSpacing:2,textTransform:"uppercase"}}>Category</div>
              <select value={nt.cat} onChange={e=>snt("cat")(e.target.value)} style={{width:"100%",background:"#08080f",border:"1.5px solid #16162a",borderRadius:12,padding:"12px 15px",color:"#e8e8ff",fontSize:13,outline:"none",fontFamily:"'Outfit',sans-serif"}}>
                {["Video Editing","Motion Graphics","YouTube Video","Short Film","Reel / TikTok","Documentary","Other"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <Inp label="Commission (PKR)" value={nt.commission} onChange={snt("commission")} placeholder="e.g. 500" type="number" required/>
            <Inp label="Deadline" value={nt.deadline} onChange={snt("deadline")} placeholder="e.g. 3 days / Open"/>
            <Inp label="Requirements (Optional)" value={nt.req} onChange={snt("req")} placeholder="e.g. 1080p, copyright-free music"/>
            <Btn ch="🎯 Post Task" v="green" onClick={addTask} disabled={!nt.title||!nt.commission}/>
          </Card>
        )}

        {tab==="members"&&(
          <div>
            {users.length===0?<div style={{textAlign:"center",color:"#2a2a4a",padding:36,fontSize:12,fontWeight:600}}>No members yet</div>:
            users.map(u=>{
              const dep=DB.transactions.find(t=>t.userId===u.id&&t.status==="approved");
              const p=dep?getPlan(dep.amount):null;
              const activeRefs=Object.values(DB.users).filter(x=>x.referrerId===u.id&&x.depositDone).length;
              return(
                <div key={u.id} style={{background:"#0c0c18",border:"1px solid #16162a",borderRadius:14,padding:13,marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <div style={{fontWeight:800,color:"#ddd",fontSize:12}}>{u.name}</div>
                    <Badge l={u.depositDone?"Active":"Inactive"} c={u.depositDone?"#22c55e":"#ef4444"}/>
                  </div>
                  <div style={{fontSize:10,color:"#1a1a2a",marginBottom:7,fontWeight:600}}>{u.phone} · Joined {u.joinDate} · {activeRefs} active refs</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {p&&<Badge l={`${p.icon} ${p.label}`} c={p.color}/>}
                    <Badge l={`Code: ${u.referralCode}`} c="#a78bfa"/>
                    <Badge l={`₨${u.balance.toLocaleString()}`} c={u.balance>0?"#b48408":"#2a2a4a"}/>
                    {u.agreedToTerms&&<Badge l="Terms ✓" c="#22c55e"/>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App(){
  const [screen,setScreen]=useState("splash");
  const [userId,setUserId]=useState(null);
  const [toastData,setToastData]=useState(null);
  const [tick,setTick]=useState(0);
  const showToast=(msg,type="info")=>setToastData({msg,type});
  const refresh=()=>setTick(t=>t+1);

  const handleLogin=id=>{
    setUserId(id);
    const u=DB.users[id];
    setScreen(u.role==="admin"?"admin":!u.depositDone?"pending":"dashboard");
  };
  const handleLogout=()=>{setUserId(null);setScreen("auth");};
  const user=userId?DB.users[userId]:null;

  return(
    <div style={{background:"#050508",minHeight:"100vh"}}>
      <style>{GS}</style>
      <div style={{maxWidth:440,margin:"0 auto",minHeight:"100vh"}}>
        {toastData&&<Toast msg={toastData.msg} type={toastData.type} onClose={()=>setToastData(null)}/>}
        {screen==="splash"&&<Splash onDone={()=>setScreen("auth")}/>}
        {screen==="auth"&&<Auth onLogin={handleLogin} toast={showToast}/>}
        {(screen==="dashboard"||screen==="pending")&&user&&(
          <UserDash key={tick} userId={userId} onLogout={handleLogout}
            onDeposit={()=>setScreen("deposit")}
            onWithdraw={()=>setScreen("withdraw")}
            onTasks={()=>setScreen("tasks")}
            toast={showToast}/>
        )}
        {screen==="deposit"&&user&&(
          <Deposit userId={userId}
            onBack={()=>setScreen(user.depositDone?"dashboard":"pending")}
            onDone={()=>{refresh();setScreen("pending");}}
            toast={showToast}/>
        )}
        {screen==="withdraw"&&user&&(
          <Withdraw userId={userId}
            onBack={()=>setScreen("dashboard")}
            toast={showToast} refresh={refresh}/>
        )}
        {screen==="tasks"&&user&&(
          <TasksScreen userId={userId}
            onBack={()=>setScreen("dashboard")}
            toast={showToast} refresh={refresh}/>
        )}
        {screen==="admin"&&<AdminPanel key={tick} onLogout={handleLogout} toast={showToast}/>}
      </div>
    </div>
  );
}
