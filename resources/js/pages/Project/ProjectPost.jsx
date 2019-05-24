import React from 'react'
import {Button, Col, Container, Row} from "react-bootstrap";
import {Link} from "react-router-dom";
import axios from '../../configs/axios'
import {postId} from './store'
import Editor from 'react-editor-md'

class ProjectPost extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            open: false,
            post: {
                id: 0,
                content: '',
            },
        };
    }
    
    getPost(id){
        postId.dispatch({type: 'set', id: id});
        this.setState({open: false});
        axios.get('/post/'+id).then((post)=>{
            this.setState({post, open: true});
        }).catch(()=>{});
    }
    
    editorConfig(){
        return {
            width: '100%',
            path: '/editor.md/lib/',
            imageUploadURL: '/api/upload_md',
            markdown: this.state.post.content,
        }
    }
    
    render(){
        return (
            <Container fluid className={'p-0'}>
                <Row className={'border-bottom py-3 px-5'} noGutters>
                    <Col xs={10}>
                        <h4>{this.state.post.name}</h4>
                    </Col>
                    <Col xs={2} className={'text-right'}>
                        <Link className={'btn btn-outline-dark'} to={'/post/'+this.props.match.params.post_id+'/edit'}>编辑</Link>
                    </Col>
                </Row>
                <div className={'py-3 px-5 post-center markdown-body'}>
                    {this.state.open &&
                        <Editor.EditorShow config={this.editorConfig()}/>
                    }
                </div>
            </Container>
        );
    }
    
    componentDidMount () {
        this.getPost(this.props.match.params.post_id);
    }
    
    componentWillReceiveProps(nextProps, nextContext) {
        if(this.props.match.params.post_id !== nextProps.match.params.post_id){
            this.getPost(nextProps.match.params.post_id);
        }
    }
}

export default ProjectPost;
