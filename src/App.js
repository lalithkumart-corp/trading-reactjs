import { Provider } from 'react-redux';

import './App.scss';
import SmartComponent from './components/smart/smartComponent';
import { getStore } from './store';
const myStore = getStore();

function App() {
  return (
    <div className="App">
        <Provider store={myStore}>
          <SmartComponent />
        </Provider>
    </div>
  );
}

export default App;
