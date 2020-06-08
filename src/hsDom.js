import hh from 'hyperscript-helpers';
import h from 'hyperscript';

const {div, span, img, label, input, select, option, br, button, p, b} = hh(h);

export default function ddDom(dispatch, model){

    if(model.numberAlert || model.sizeAlert.show) {
        setTimeout(() => {
            const el = document.querySelector('#modal1');
            const modal = M.Modal.init(el);
            modal.open();
        }, 50);
    }

    return div('#uploaderCont', [
        ddCont(dispatch),
        queueCont(dispatch, model),
        submitCont(dispatch, model),
        div('#modal1.modal', [
            div('.modal-content', [
                p(model.numberAlert ? `
                    The limit for the number of file uploads is ${model.fileLimit}
                ` : `
                    The size limit for individual files is ${model.sizeLimit} MB.
                `),
                () => {
                    if (!model.numberAlert) {
                        return p([
                            b(model.sizeAlert.name),
                            ` is ${(model.sizeAlert.size/1048576).toFixed(1)} MB`
                            ]);
                    } else {
                        return br();
                    }
                }
            ]),
            div('.modal-footer', [
                button('.modal-close.waves-effect.waves-green.btn-flat', 'Close')
            ])
        ])
    ]);
}

function ddCont(dispatch){
    return div('#ddArea.container', [
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
                    dispatch('dropfile', e)
                },
            }, [
                span('.material-icons.uploadIco', 'cloud_upload'),
                span('Drag files here or', [
                    label('browse for files',[
                        input(
                            {
                                value: 'browse',
                                type: 'file',
                                style: 'display:none',
                                multiple: true,
                                onchange: (e)=> dispatch('manualSelect', e)
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
                name: file.name,
                value: file.description,
                onchange: (e) => dispatch('updateDesc', e)
            }),
        ])
    );
    if (model.selectOpts) row.push(
        div('.col.s3.options.valign-wrapper', [
            select({
                style: 'display:inline-block',
                name: file.name,
                value: file.fileType,
                onchange: (e) => dispatch('updateType', e)
            }, buildFileTypeOpts(model, file))
        ])
    );
    row.push(
        div('.col.s3.remove.valign-wrapper', [
            button(
                '.btn.btn-small.waves-effect.waves-light.red',
                {
                    name: file.name,
                    onclick: (e) => dispatch('remove', e)
                },
                'remove')
        ])
    );
    return row;
}

function buildFileTypeOpts(model, file) {
    let defaultOpt = {value: '', disabled: 'disabled'};
    if(!file.fileType) defaultOpt = {selected: 'selected', ...defaultOpt};
    let options = [option(defaultOpt, 'Select this file type')];
    Object.keys(model.selectOpts).forEach( key => {
        let optionTemplate = {value: key};
        if(file.fileType == key) optionTemplate = {selected: 'selected', ...optionTemplate};
        options.push(option(optionTemplate, model.selectOpts[key]));
    });
    return options;
}

function queueCont(dispatch, model) {
    console.log('queuecont model', model);
    return div('#queue.container', model.files.map( file =>
            div('.row', buildQueueCols(model, file, dispatch))
        ));
} // queueCont

function submitCont(dispatch, model) {
    const submitDom = div('#submit.container', [
        div('.row', [
            div('.col.s12.right-align', [
                button(
                    '.btn.waves-effect.waves-light.blue',
                    {onclick: (e) => dispatch('submit')},
                    'Upload')
            ])
        ])
    ]);
    return model.files.length ? submitDom : '';
}
