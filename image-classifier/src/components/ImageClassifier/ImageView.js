import React, { useState } from 'react';

const ImageView = ({ imageSrc, imageRef, onImageLoad }) => {
  return (
    imageSrc && (
      <img
        ref={imageRef}
        src={imageSrc}
        width="300"
        alt="uploaded"
        onLoad={onImageLoad}
        style={{ borderRadius: 12 }}
      />
    )
  );
};

export default ImageView;
