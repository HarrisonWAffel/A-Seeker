import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import { Modal,ModalManager,Effect} from 'react-dynamic-modal';

class MyModal extends Component{
    render(){
        const { text,onRequestClose } = this.props;
        return (
            <Modal
                onRequestClose={onRequestClose}
                effect={Effect.Newspaper}>
                <h1>What you input : {text}</h1>
                <button onClick={ModalManager.close}>Close Modal</button>
            </Modal>
        );
    }

}
export default Modal;