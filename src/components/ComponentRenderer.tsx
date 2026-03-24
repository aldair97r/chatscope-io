import React from 'react';

interface ComponentRendererProps {
  type: string;
  props?: Record<string, unknown>;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({ type, props = {} }) => {
  switch (type) {
    case 'button':
      return (
        <button
          onClick={() => alert(props.onClickMessage?.toString() || 'Button clicked!')}
          style={{
            padding: '8px 16px',
            backgroundColor: props.color?.toString() || '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            margin: '4px 0',
          }}
        >
          {props.label?.toString() || 'Click me'}
        </button>
      );

    case 'card':
      return (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            margin: '4px 0',
            maxWidth: '250px',
          }}
        >
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
            {props.title?.toString() || 'Card Title'}
          </h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
            {props.description?.toString() || 'Card description goes here'}
          </p>
        </div>
      );

    case 'alert':
      const severity = props.severity?.toString() || 'info';
      const alertColors: Record<string, string> = {
        info: '#cce5ff',
        success: '#d4edda',
        warning: '#fff3cd',
        error: '#f8d7da',
      };
      const alertTextColors: Record<string, string> = {
        info: '#004085',
        success: '#155724',
        warning: '#856404',
        error: '#721c24',
      };
      return (
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: alertColors[severity],
            color: alertTextColors[severity],
            borderRadius: '4px',
            fontSize: '13px',
            margin: '4px 0',
            maxWidth: '250px',
          }}
        >
          {props.message?.toString() || 'Alert message'}
        </div>
      );

    case 'badge':
      return (
        <span
          style={{
            display: 'inline-block',
            padding: '4px 8px',
            backgroundColor: props.color?.toString() || '#6c757d',
            color: 'white',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 500,
            margin: '2px',
          }}
        >
          {props.label?.toString() || 'Badge'}
        </span>
      );

    default:
      return (
        <div
          style={{
            padding: '8px',
            border: '1px dashed #ccc',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#666',
          }}
        >
          Unknown component: {type}
        </div>
      );
  }
};
