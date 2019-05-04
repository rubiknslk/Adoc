import React from "react";
import { HashRouter as Router, Route } from "react-router-dom";
import {Navbar, Nav, NavDropdown, Form, FormControl, Button, Spinner} from 'react-bootstrap';

// 异步加载其他组件
// const Index = React.lazy(() => import('./index/index'));
import Index from '../Index/Index.jsx';
import {Loading} from './store';

function About() {
    return <h2>About</h2>;
}

function Users() {
    return <h2>Users</h2>;
}

class AppRouter extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            loading: Loading.getState(),
        };
        Loading.subscribe(() => this.setState({loading: Loading.getState()}));
    }
    render () {
        return (
            <Router>
                <Navbar bg="light" expand="md">
                    <Navbar.Brand href="#/">React-Bootstrap</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mr-auto">
                            <Nav.Link href="#/project">Home</Nav.Link>
                            <Nav.Link href="#/about">About</Nav.Link>
                            <Nav.Link href="#/users">Users</Nav.Link>
                            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                                <NavDropdown.Item href="#/logout">Action</NavDropdown.Item>
                                <NavDropdown.Item href="#/register">Another action</NavDropdown.Item>
                                <NavDropdown.Item href="#/login">Something</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                        <Form inline>
                            <FormControl type="text" placeholder="Search" className="mr-sm-2" />
                            <Button variant="outline-success">Search</Button>
                            <Spinner animation="border" size={'sm'} className={'ml-2'+' '+ this.state.loading} />
                        </Form>
                    </Navbar.Collapse>
                </Navbar>
                <div>
                    <React.StrictMode>
                        <React.Suspense fallback={<div>Loading</div>}>
                            <Route path="/project" exact component={Index}/>
                            <Route path="/project/:id" component={Index}/>
                            <Route path="/about" component={About} />
                            <Route path="/users" component={Users} />
                        </React.Suspense>
                    </React.StrictMode>
                </div>
            </Router>
        );
    }
}
export default AppRouter;