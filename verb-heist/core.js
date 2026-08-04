(function(root){
const normalize=value=>String(value||'').trim().toLowerCase().replace(/\s+/g,' ');
const checkAnswer=(input,expected)=>normalize(input)===normalize(expected);
const pickUnique=(items,count,rng=Math.random)=>{const pool=[...items],out=[];while(out.length<count&&pool.length){out.push(pool.splice(Math.floor(rng()*pool.length),1)[0])}return out};
const scoreFor=(attempt,hint,streak)=>Math.max(0,(attempt===1?100:50)*(streak>0&&streak%5===0?2:1)-(hint?25:0));
const createState=(verbs,rng=Math.random)=>({status:'playing',verbs:pickUnique(verbs,5,rng),block:0,task:0,score:0,streak:0,bestStreak:0,lives:3,errors:0,blockErrors:0,answered:0,correct:0,attempt:0,hintUsed:false,noRecord:false,opened:0,taskVariant:Math.floor(rng()*2)});
const recordWrong=s=>{s.attempt++;s.errors++;s.blockErrors++;s.streak=0;if(s.attempt>=2)s.lives=Math.max(0,s.lives-1);return s};
const advanceTask=s=>{s.attempt=0;s.hintUsed=false;if(s.task<2)s.task++;else{s.opened++;s.block++;s.task=0;s.blockErrors=0;if(s.opened>=5)s.status='completed'}return s};
const api={normalize,checkAnswer,pickUnique,scoreFor,createState,recordWrong,advanceTask};root.VerbHeistCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
