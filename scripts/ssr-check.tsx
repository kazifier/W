// Server-render the whole app tree to prove it renders without throwing.
import { renderToString } from 'react-dom/server';
import App from '../src/App';

const html = renderToString(<App />);
console.log('rendered chars:', html.length);
console.log('has tab bar:', html.includes('Summary sheet') && html.includes('Scenarios'));
console.log('has seeded tag S-01:', html.includes('S-01'));
console.log('has tube scenario S-05:', html.includes('S-05'));
console.log('has component selector:', html.includes('Component type'));
if (html.length < 5000) {
  console.error('RENDER LOOKS WRONG');
  process.exit(1);
}
