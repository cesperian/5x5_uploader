import hh from 'hyperscript-helpers';
import h from 'hyperscript';

const {div, span, img, label, input, select, option, br, button} = hh(h);

export default function ddDom(dispatch, model){
    return div('#uploaderCont', [
        ddCont(dispatch),
        queueCont(dispatch, model),
        submitCont(dispatch, model)
    ]);
}

function ddCont(dispatch){
    return div('#ddArea.container', [
        div('.row.ddHandler', [
            div('#dragandrophandler.col.s12.valign-wrapper', {
                // ondragenter: (e) => e.target.classList.add('active'),
                // ondragover: (e) => e.target.classList.add('active'),
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

function queueCont(dispatch, model) {
    // console.log('queuecont model', model);
    return div('#queue.container', model.map( file =>
        div('.row', [
            div('.col.s3.name.valign-wrapper', [
                span('.truncate', file.name)
            ]),
            div('.col.s3.desc.valign-wrapper', [
                input({
                    type: 'text',
                    placeholder: 'Description of file',
                    maxLength: '100'
                }),
            ]),
            div('.col.s3.options.valign-wrapper', [
                select({style: 'display:inline-block'},[
                    option({
                        value: '',
                        disabled: 'disabled',
                        selected: 'selected'
                    }, 'Select this file type'),
                    option({
                        value: '',
                    }, 'Select this file type'),
                    option({
                        value: '',
                    }, 'Select this file type')
                ])
            ]),
            div('.col.s3.remove.valign-wrapper', [
                button(
                    '.btn.btn-small.waves-effect.waves-light.red',
                    {
                        name: file.name,
                        onclick: (e) => dispatch('remove', e)
                    },
                    'remove')
            ])
        ])
    ));
}

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
    return model.length ? submitDom : '';
}
