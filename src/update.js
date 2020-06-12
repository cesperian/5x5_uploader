
const axios = require('axios').default;
const querystring = require('querystring');

const MSGS = {
    REMOVE_FILE: 'REMOVE_FILE',
    ADD_FILES: 'ADD_FILES',
    UPDATE_DESCRIPTION: 'UPDATE_DESCRIPTION',
    UPDATE_TYPE: 'UPDATE_TYPE',
    CLEAR_ALERTS: 'CLEAR_ALERTS',
    HTTP_SUBMIT: 'HTTP_SUBMIT',
    HTTP_SUCCESS: 'HTTP_SUCCESS',
    HTTP_ERROR: 'HTTP_ERROR',
    HTTP_PROGRESS: 'HTTP_PROGRESS'
};

export function setTypeMSG(fileType, name){
    return {
        type: MSGS.UPDATE_TYPE,
        name,
        fileType
    };
}
export function setDescMSG(description, name) {
    return {
        type: MSGS.UPDATE_DESCRIPTION,
        name,
        description
    };
}
export function addFilesMSG(files) {
    return {
        type: MSGS.ADD_FILES,
        files
    };
}
export function removeFileMSG(name) {
    return {
        type: MSGS.REMOVE_FILE,
        name
    }
}
export const clearAlertsMSG = {type: MSGS.CLEAR_ALERTS};

// todo; these args could be reduced to just model + msg after refactor...
function updateModel(msg, model, e, dispatch) {
    console.log('update', model);
    switch (msg.type) {
        case MSGS.CLEAR_ALERTS: return {...model, alertMessages: []};
        case MSGS.UPDATE_TYPE: {
            const {name, fileType} = msg;
            const files = model.files.map(f => {
                if (name === f.name) f.fileType = fileType;
                return f;
            });
            return {...model, files};
        }
        case MSGS.UPDATE_DESCRIPTION: {
            const {name, description} = msg;
            const files = model.files.map(f => {
                if (name === f.name) f.description = description;
                return f;
            });
            return {...model, files};
        }
        case MSGS.ADD_FILES: {
            const {files, fileLimit, sizeLimit} = model;
            const fl = msg.files; // files to add...
            if (files.length == fileLimit || fileLimit < files.length + fl.length) {
                return {
                    ...model,
                    alertMessages: [`The limit for the number of file uploads is ${fileLimit}`]
                };
            }
            for (let i =0; i < fl.length; i++) {
                if (fl[i].size > (sizeLimit * 1048576)) {
                    return {
                        ...model,
                        alertMessages: [
                            `The size limit for individual files is ${sizeLimit} MB.`,
                            `${fl[i].name} is ${(fl[i].size / 1048576).toFixed(1)} MB`
                        ]
                    };
                }else{
                    files.push(fl[i]);
                }
            }
            return {...model, files: files};
        }
        case MSGS.REMOVE_FILE: {
            const {name} = msg;
            const files = model.files.filter(f => f.name !== name);
            return {...model, files};
        }
        // case 'manualSelect': return queueFiles(e.srcElement.files, model);
        // case 'remove': return removeFile(model, e);
        // case 'dropfile': return queueFiles(e.dataTransfer.files, model);
        // case 'updateDesc': return updateDesc(model, e);
        // case 'updateType': return updateType(model, e);
        //
        // case 'submit': return submitFiles(model, dispatch);
        // case 'submitSuccess': return submitSuccess(model);
        // case 'submitError': return submitError(model, e);
        // case 'uploadProgress': return model;
        default: return model;
    }
}

function submitError(model, e){
    return {
        ...model,
        alertMessages: ['File upload failed',e],
        isSubmitting: false,
        submitProgress: 0
    };
}

function submitSuccess(model){
    return {
        ...model,
        alertMessages: [`File${model.files.length > 1 ? 's' : ''} successfully uploaded`],
        files: [],
        isSubmitting: false,
        submitProgress: 0
    };
}

function submitFiles(model, dispatch) {
    model.isSubmitting = true;
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
                model.submitProgress = Math.ceil(pos / e.total * 100 );
                dispatch('uploadProgress');
            }
        }
    })
        .then(r => {
            dispatch('submitSuccess');
        })
        .catch(e => {
            dispatch('submitError', e)
        });
    return model;
}

export default updateModel;
