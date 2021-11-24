import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Home from './views/Home';
import NotFound from './views/NotFound';
import Configuracao from './views/Configuracao';
import { ToastProvider } from 'react-toast-notifications'

const Routes = () => {
    return (
        <>
            <ToastProvider>
                <BrowserRouter>
                    <Switch>
                        <Route path='/config' exact component={Configuracao} />
                        <Route path='/' exact component={Home} />
                        <Route path='*' component={NotFound} />
                    </Switch>
                </BrowserRouter>
            </ToastProvider>
        </>
    )
}

export default Routes;