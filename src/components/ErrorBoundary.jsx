"use client";
import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props){
    super(props); this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error){ return { hasError: true, error }; }
  componentDidCatch(error, info){ /* log could go here */ }
  render(){
    if (this.state.hasError){
      return <div role="alert" style={{border:'2px solid #ef4444', padding:'1rem', borderRadius:'8px'}}>
        <h3 style={{marginTop:0}}>Something went wrong.</h3>
        <p>{String(this.state.error)}</p>
        <button className="cta-btn" onClick={()=>this.setState({hasError:false,error:null})}>Retry</button>
      </div>;
    }
    return this.props.children;
  }
}
