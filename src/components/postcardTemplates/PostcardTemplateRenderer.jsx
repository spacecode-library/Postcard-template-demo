import React from 'react';
import { postcardTemplates } from './index';

const PostcardTemplateRenderer = ({ templateId, businessData }) => {
  const template = postcardTemplates.find(t => t.id === templateId);
  
  if (!template) {
    return (
      <div className="template-error">
        <p>Template not found</p>
      </div>
    );
  }
  
  const TemplateComponent = template.component;
  const mergedData = {
    ...template.defaultData,
    ...businessData
  };
  
  return (
    <div className="postcard-template-wrapper" data-template={templateId}>
      <TemplateComponent businessData={mergedData} />
    </div>
  );
};

export default PostcardTemplateRenderer;