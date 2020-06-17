import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import {
    setTypeMSG,
    setDescMSG,
    addFilesMSG,
    removeFileMSG,
    httpSubmitMsg,
    activeDropMSG
} from "./update";

const {div, span, img, label, input, select, option, br, button, p} = hh(h);

export default function ddDom(dispatch, model){

    return div('#uploaderCont', [
        progressCont(model),
        ddCont(dispatch, model),
        queueCont(dispatch, model),
        submitCont(dispatch, model),
        modal(dispatch, model)
    ]);
}

function progressCont(model) {
    return div('#progress.container', {style: `display:${model.isSubmitting ? 'block':'none'}`}, [
        div('.row', [
            div('.col.s12',[
                div('.progress', [
                    div('.determinate', {style: `width:${model.submitProgress}%`})
                ])
            ])
        ])
    ]);
}

function modal(dispatch, model){
    return div('#modal1.modal', [
        div('.modal-content', model.alertMessages.map(m => p(m))),
        div('.modal-footer', [
            button(
                '.modal-close.waves-effect.waves-green.btn-flat',
                'Close'
            )
        ])
    ]);
}

function ddCont(dispatch, model){
    return div('#ddArea.container', {style: `opacity:${model.isSubmitting ? '0':'100'}`}, [
        div('.row.ddHandler', [
            div(`#dragandrophandler.col.s12.valign-wrapper${model.dropAreaActive ? '.active' : ''}`, {
                ondragenter: (e) => dispatch(activeDropMSG(true, e)),
                ondragover: (e) => dispatch(activeDropMSG(true, e)),
                ondragleave: (e) => dispatch(activeDropMSG(false, e)),
                ondrop: (e) => dispatch(addFilesMSG(e.dataTransfer.files, e))
            }, [
                span('.material-icons.uploadIco', 'cloud_upload'),
                span({}, [
                    'Drag files here or',
                    label({}, [
                        'browse for files',
                        input(
                            {
                                type: 'file',
                                style: 'display:none',
                                multiple: true,
                                onchange: (e)=> dispatch(addFilesMSG(e.srcElement.files, e))
                            }
                        )
                    ])
                ])
            ])
        ])
    ]);
}

function buildQueueCols(model, file, dispatch) {
    const nameCol = div(`.col.s${model.selectOpts || model.showDescription ? '3' : '9'}.name.valign-wrapper`, [
            span('.truncate', file.name)
        ]);
    const descCol = model.showDescription ?
        div(`.col.s${model.selectOpts ? '3' : '6'}.desc.valign-wrapper`, [
            input({
                type: 'text',
                placeholder: 'Description of file',
                maxLength: '100',
                value: file.description,
                onchange: (e) => dispatch(setDescMSG(e.target.value, file.name))
            }),
        ]) : null;
    const typeCol = model.selectOpts ?
        div(`.col.s${model.showDescription ? '3' : '6'}.options.valign-wrapper`, [
            select({
                style: 'display:inline-block',
                value: file.fileType,
                onchange: (e) => dispatch(setTypeMSG(e.target.value, file.name))
            }, buildFileTypeOpts(model, file))
        ]) : null;
    const removeCol = div('.col.s3.remove.valign-wrapper', [
            button(
                '.btn.btn-small.waves-effect.waves-light.red',
                {onclick: (e) => dispatch(removeFileMSG(file.name))},
                'remove')
        ]);
    return [nameCol, descCol, typeCol, removeCol];
}

function buildFileTypeOpts(model, file) {
    const defaultOption = option({
        value: '',
        disabled: 'disabled',
        selected: !file.fileType
        }, 'Select this file type');
    const options = Object.keys(model.selectOpts).map(key => {
        return option({
            value: key,
            selected: file.fileType == key
        }, model.selectOpts[key]);
    });
    return [defaultOption, ...options];
}

function queueCont(dispatch, model) {
    return div('#queue.container', {style: `display:${!model.isSubmitting ? 'block':'none'}`}, model.files.map( file =>
            div('.row', buildQueueCols(model, file, dispatch))
        ));
}

function submitCont(dispatch, model) {
    const submitDom = div('#submit.container', {style: `display:${!model.isSubmitting ? 'block':'none'}`},[
        div('.row', [
            div('.col.s12.right-align', [
                button(
                    '.btn.waves-effect.waves-light.blue',
                    {onclick: (e) => dispatch(httpSubmitMsg)},
                    'Upload')
            ])
        ])
    ]);
    return model.files.length ? submitDom : '';
}
