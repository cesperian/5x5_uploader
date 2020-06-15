import hh from 'hyperscript-helpers';
import { h } from 'virtual-dom';
import {
    setTypeMSG,
    setDescMSG,
    addFilesMSG,
    removeFileMSG,
    httpSubmitMsg
} from "./update";

const {div, span, img, label, input, select, option, br, button, p, b} = hh(h);

export default function ddDom(dispatch, model){

    // yuck
    // if(model.alertMessages.length) {
    //     setTimeout(() => {
    //         const el = document.querySelector('#modal1');
    //         const modal = M.Modal.init(el, {onCloseEnd: () => dispatch(clearAlertsMSG)});
    //         modal.open();
    //     }, 50);
    // }

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
            div('#dragandrophandler.col.s12.valign-wrapper', {
                ondragenter: (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    e.target.classList.add('active');
                },
                ondragover: (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                },
                ondragleave: (e) => e.target.classList.remove('active'),
                ondrop: (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    e.target.classList.remove('active');
                    dispatch(addFilesMSG(e.dataTransfer.files))
                },
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
                                onchange: (e)=> dispatch(addFilesMSG(e.srcElement.files))
                            }
                        )
                    ])
                ])
            ])
        ])
    ]);
}

function buildQueueCols(model, file, dispatch) {
    let row = [
        div('.col.s3.name.valign-wrapper', [
            span('.truncate', file.name)
        ])
    ];
    if (model.showDescription) row.push(
        div('.col.s3.desc.valign-wrapper', [
            input({
                type: 'text',
                placeholder: 'Description of file',
                maxLength: '100',
                value: file.description,
                onchange: (e) => dispatch(setDescMSG(e.target.value, file.name))
            }),
        ])
    );
    if (model.selectOpts) row.push(
        div('.col.s3.options.valign-wrapper', [
            select({
                style: 'display:inline-block',
                value: file.fileType,
                onchange: (e) => dispatch(setTypeMSG(e.target.value, file.name))
            }, buildFileTypeOpts(model, file))
        ])
    );
    row.push(
        div('.col.s3.remove.valign-wrapper', [
            button(
                '.btn.btn-small.waves-effect.waves-light.red',
                {onclick: (e) => dispatch(removeFileMSG(file.name))},
                'remove')
        ])
    );
    return row;
}

// todo; get rid of all .push() methods, use R 'append', etc and keep vars immutable
//  replace 'let's w const where possible
function buildFileTypeOpts(model, file) {
    let options = [option({
        value: '',
        disabled: 'disabled',
        selected: !file.fileType
        }, 'Select this file type')];
    Object.keys(model.selectOpts).forEach( key => {
        options.push(option({
            value: key,
            selected: file.fileType == key
        }, model.selectOpts[key]));
    });
    return options;
}

function queueCont(dispatch, model) {
    return div('#queue.container', {style: `display:${!model.isSubmitting ? 'block':'none'}`}, model.files.map( file =>
            div('.row', buildQueueCols(model, file, dispatch))
        ));
} // queueCont

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
