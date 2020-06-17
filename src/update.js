
const MSGS = {
    ACTIVE_DROP: 'ACTIVE_DROP',
    ADD_FILES: 'ADD_FILES',
    REMOVE_FILE: 'REMOVE_FILE',
    UPDATE_DESCRIPTION: 'UPDATE_DESCRIPTION',
    UPDATE_TYPE: 'UPDATE_TYPE',
    CLEAR_ALERTS: 'CLEAR_ALERTS',
    HTTP_SUBMIT: 'HTTP_SUBMIT',
    HTTP_RESPONSE: 'HTTP_RESPONSE',
    HTTP_PROGRESS: 'HTTP_PROGRESS'
};
export const SETYPE = {
    INIT_POST: 'INIT_POST',
    ALERT: 'ALERT',
    STOP_EVENT: 'STOP_EVENT'
};
export const httpSubmitMsg = {type: MSGS.HTTP_SUBMIT};
export const clearAlertsMSG = {type: MSGS.CLEAR_ALERTS};
export function activeDropMSG(dropAreaActive, event) {
    return {
        type: MSGS.ACTIVE_DROP,
        dropAreaActive,
        event
    };
};
export function httpResponseMSG(response, isErr){
    return {
        type: MSGS.HTTP_RESPONSE,
        isErr,
        response
    }
}
export function httpProgressMSG(submitProgress) {
    return {
        type: MSGS.HTTP_PROGRESS,
        submitProgress
    };
}
export function setTypeMSG(fileType,dropAreaActive, name){
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
export function addFilesMSG(fileList, event) {
    return {
        type: MSGS.ADD_FILES,
        fileList,
        event
    };
}
export function removeFileMSG(name) {
    return {
        type: MSGS.REMOVE_FILE,
        name
    }
}

function updateModel(msg, model) {
    switch (msg.type) {
        case MSGS.CLEAR_ALERTS: return [{...model, alertMessages: []}];
        case MSGS.UPDATE_TYPE: {
            const {name, fileType} = msg;
            const files = model.files.map(f => {
                if (name === f.name) f.fileType = fileType;
                return f;
            });
            return [{...model, files}];
        }
        case MSGS.ACTIVE_DROP: {
            const {dropAreaActive, event} = msg;
            return [{...model, dropAreaActive},{cmds: [{seType: SETYPE.STOP_EVENT, event}]}];
        }
        case MSGS.UPDATE_DESCRIPTION: {
            const {name, description} = msg;
            const files = model.files.map(f => {
                if (name === f.name) f.description = description;
                return f;
            });
            return [{...model, files}];
        }
        case MSGS.ADD_FILES: {
            const {files, fileLimit, sizeLimit} = model;
            const {fileList,event} = msg;
            if (files.length == fileLimit || fileLimit < files.length + fileList.length) {
                return [{
                    ...model,
                    dropAreaActive: false,
                    alertMessages: [`The limit for the number of file uploads is ${fileLimit}`]
                },{cmds: [{seType: SETYPE.STOP_EVENT, event}, {seType: SETYPE.ALERT}]}];
            }
            const sizeExc = Array.from(fileList).find(f => f.size > (sizeLimit * 1048576));
            if(sizeExc) {
                return [{
                    ...model,
                    dropAreaActive: false,
                    alertMessages: [
                        `The size limit for individual files is ${sizeLimit} MB.`,
                        `${sizeExc.name} is ${(sizeExc.size / 1048576).toFixed(1)} MB`
                    ]
                },{cmds: [{seType: SETYPE.STOP_EVENT, event}, {seType: SETYPE.ALERT}]}];
            }
            return [
                {...model, files: [...files, ...fileList], dropAreaActive: false},
                {cmds: [{seType: SETYPE.STOP_EVENT, event}]}
            ];
        }
        case MSGS.REMOVE_FILE: {
            const {name} = msg;
            const files = model.files.filter(f => f.name !== name);
            return [{...model, files}];
        }
        case MSGS.HTTP_SUBMIT: {
            return [
                {...model, isSubmitting: true},
                {cmds: [{seType: SETYPE.INIT_POST}]}
            ];
        }
        case MSGS.HTTP_PROGRESS: {
            return [{...model, submitProgress: msg.submitProgress}];
        }
        case MSGS.HTTP_RESPONSE: {
            const {isErr, response} = msg;
            const alertMessages = !isErr ?
                [`File${model.files.length > 1 ? 's' : ''} successfully uploaded`]
                : ['File upload failed', response.message];
            const files = !isErr ? [] : model.files;
            return [{
                ...model,
                files,
                alertMessages,
                isSubmitting: false,
                submitProgress: 0
            }, {cmds: [{seType: SETYPE.ALERT}]}];
        }
        default: return [model];
    }
}

export default updateModel;
