import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import renderer from 'react-test-renderer'; //creates snapshots of test components for testing

describe('App', () => {

    it('renders', () => {
        const div = document.createElement('div');
        ReactDOM.render(<App />, div);
        });

test('snapshots', () => {
    const component = renderer.create(
    <App />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
    });
    });