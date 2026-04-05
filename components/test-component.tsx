"use client"

import React from "react"

export default function TestComponent() {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#1a1a1a', 
      color: 'white',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#10b981', marginBottom: '20px' }}>
        UPI Payment System - Test Component
      </h1>
      <p style={{ fontSize: '18px', marginBottom: '10px' }}>
        This is a minimal test component to check if React is working.
      </p>
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#374151', 
        borderRadius: '8px',
        marginBottom: '10px'
      }}>
        <p>✅ React is rendering</p>
        <p>✅ Component is loaded</p>
        <p>✅ Styles are applied</p>
      </div>
      <button 
        onClick={() => alert('Button clicked!')}
        style={{
          padding: '10px 20px',
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Test Button
      </button>
    </div>
  )
}
