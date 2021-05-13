
// uncomment if building w/o materialize cdn...
// import 'materialize-css/dist/css/materialize.css';

import './ul.scss';
import updateModel from './update'; // data model -> updated data model
import view from './hsDom'; // xform data model -> html+css
import app from './app';

const initModel = {
    destination:null,
    destinationParams:null,
    sizeLimit:1,
    fileLimit:5,
    selectOpts:null,
    showDescription:false,
    files: [],
    alertMessages: [],
    isSubmitting: false,
    submitProgress: 0,
    dropAreaActive: false
};

window.addEventListener('DOMContentLoaded', () => {
    const rootNode = document.querySelector('#uploader');
    app(initModel, view, rootNode, updateModel);
});

