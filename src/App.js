
import { SnackbarProvider } from 'notistack';
import Main from './Main/Main'

function App() {
  return (
    <SnackbarProvider maxSnack={1} >
      <div className="App">
        <Main/>
      </div>
    </SnackbarProvider>
    
  );
}

export default App;
