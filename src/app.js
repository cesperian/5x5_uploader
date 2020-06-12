
import { diff, patch } from 'virtual-dom';
import createElement from 'virtual-dom/create-element';


function app(initModel, view, node, updateModel) {
    const config = JSON.parse(node.querySelector('#config').innerHTML);
    let model = {...initModel, ...config};
    if (model.showDescription) File.prototype.description = '';
    if (model.selectOpts) File.prototype.fileType = '';

    // for initial view..
    let currentView = view(dispatch, model);
    let rootNode = createElement(currentView);
    node.appendChild(rootNode);

    // ...and updated view (dispatch nested here to isolate side effects) ...
    function dispatch(msg, e) {
        model = updateModel(msg, model, e, dispatch);
        const updatedView = view(dispatch, model);
        const patches = diff(currentView, updatedView);
        rootNode = patch(rootNode, patches);
        currentView = updatedView;
        console.log('model', model);
    }
}

export default app;
