import React from 'react';

// This file is the root component for your web app.
// It is only used on the web.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>RichyReach</title>
        
        {/* Link PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#208AEF" />

        {/* 
          Disable body scrolling on web. This makes ScrollView components work as expected. 
          See: https://github.com/necolas/react-native-web/blob/main/docs/guides/setup.md#root-element
        */}
        <style dangerouslySetInnerHTML={{ __html: htmlStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const htmlStyles = `
body {
  background-color: #E6F4FE;
  overflow: hidden; /* Disable scrolling on document.body */
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #121212;
  }
}
`;
