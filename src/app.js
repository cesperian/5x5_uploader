
import { diff, patch } from 'virtual-dom';
import createElement from 'virtual-dom/create-element';
import {SETYPE, httpProgressMSG, httpResponseMSG, clearAlertsMSG} from "./update";
import * as M from "materialize-css";
const axios = require('axios').default;
const querystring = require('querystring');

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
    function dispatch(msg) {
        const [updatedModel, cmd] = updateModel(msg, model);
        model = updatedModel;
        if(cmd) runSideEffects(cmd, dispatch, model);
        const updatedView = view(dispatch, model);
        const patches = diff(currentView, updatedView);
        rootNode = patch(rootNode, patches);
        currentView = updatedView;
        // console.log('model', model);
        // if(cmd)console.log('cmd', cmd.seType);
    }
}

function runSideEffects(cmd, dispatch, model) {
    switch (cmd.seType) {
        case SETYPE.INIT_POST: {
            let fd = new FormData();
            model.files.forEach(f => {
                fd.append("file", f);
            });
            axios({
                method: 'post',
                url: model.destination,
                params: model.destinationParams,
                paramsSerializer: (params) => querystring.stringify(params),
                headers: {'Content-Type': 'multipart/form-data'},
                data: fd,
                onUploadProgress: (e) => {
                    let pos = e.loaded || e.position;
                    if (e.lengthComputable){
                        const progress = Math.ceil(pos / e.total * 100 );
                        dispatch(httpProgressMSG(progress));
                    }
                }
            })
                .then(r => {
                    dispatch(httpResponseMSG(r, false));
                })
                .catch(e => {
                    dispatch(httpResponseMSG(e, true));
                });
            break;
        }
        case SETYPE.ALERT: {
            setTimeout(() => {
                const el = document.querySelector('#modal1');
                const modal = M.Modal.init(el, {onCloseEnd: () => dispatch(clearAlertsMSG)});
                modal.open();
            }, 50);
            break;
        }
    } // switch
} // runSideEffects


export default app;
