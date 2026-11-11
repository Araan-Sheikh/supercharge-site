'use client';
import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';

const stages = [
  { name: 'Read', file: 'src / auth / session.ts', title: 'Understand the repository', lines: ['› Fix the expired-session redirect.', 'Read project instructions', 'Find the session handler', 'Inspect the existing tests'], note: 'Start with the code and project rules.' },
  { name: 'Plan', file: 'Plan · session expiry', title: 'Work through the change', lines: ['1  Handle an expired token', '2  Return to the sign-in screen', '3  Add a regression test', '4  Run the relevant tests'], note: 'Use Plan mode before making changes.' },
  { name: 'Edit', file: 'src / auth / session.ts', title: 'Make a focused edit', lines: ['  if (session.expired) {', '−   return null;', '+   return redirect("/sign-in");', '  }'], note: 'Illustrative diff · review changes in your workspace.' },
  { name: 'Verify', file: 'tests / auth / session.test.ts', title: 'Check the result', lines: ['✓ active session', '✓ expired session redirects', '✓ missing session', '3 tests passed · example output'], note: 'Inspect tool output before accepting the result.' },
];
export function AgentSequence() {
  const [step,setStep] = useState(0);
  const [playing,setPlaying] = useState(false);
  const [visible,setVisible] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  useEffect(()=>{const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting)); if(frame.current)observer.observe(frame.current);return ()=>observer.disconnect();},[]);
  useEffect(()=>{
    if(!playing || !visible) return;
    const timer=setTimeout(()=>{if(step===3)setPlaying(false);else setStep(step+1);},2400);
    return ()=>clearTimeout(timer);
  },[playing,visible,step]);
  const select=(index:number)=>{setPlaying(false);setStep(index);};
  return <div className="agent-sequence" ref={frame}>
    <div className="sequence-caption"><span>AGENT WORKFLOW</span><span>Interactive example / {String(step+1).padStart(2,'0')}</span></div>
    <div className="sequence-steps" role="group" aria-label="Agent workflow example">{stages.map((stage,index)=><button key={stage.name} type="button" aria-pressed={step===index} onClick={()=>select(index)}><span>{index<step?'✓':String(index+1).padStart(2,'0')}</span>{stage.name}</button>)}</div>
    <div className="sequence-body" key={step}><div className="sequence-file"><span>⌘</span>{stages[step].file}</div><h3>{stages[step].title}</h3><div className="sequence-code">{stages[step].lines.map((line,index)=><div key={line} style={{animationDelay:`${index*70}ms`}} className={line.startsWith('+')?'added':line.startsWith('−')?'removed':''}><span>{String(index+1).padStart(2,'0')}</span><code>{line}</code></div>)}</div></div>
    <div className="sequence-footer"><p>{stages[step].note}</p><button type="button" aria-label={playing?'Pause example':step===3?'Replay example':'Play example'} onClick={()=>{if(step===3)setStep(0);setPlaying(!playing);}}>{playing?<Pause size={13}/>:step===3?<RotateCcw size={13}/>:<Play size={13}/>}</button></div>
  </div>;
}
