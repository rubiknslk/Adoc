import React from 'react'
import {Link, Router} from "react-router-dom";
import {Image ,Nav, Collapse} from "react-bootstrap";
import ListPng from '../../../images/list.png'
import FolderOpenFill from '../../../images/folder open-fill.png'
import FolderFill from '../../../images/folder-fill.png'
import {postId} from "./store";


class ProjectMenu extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            post_id: 0,
        };
    
        this.postIdSubscribe = postId.subscribe(() => {
            this.setState({post_id: postId.getState()});
        });
    }
    
    toggle(post){
        post.toggle = !post.toggle;
        this.props.onChange(this.props.posts);
    }
    
    subMenu(posts, padding = 1){
        return (
            <div className={'project-left-posts'}>
                {posts && posts.length > 0 && (
                    <Nav className={'flex-column'}>
                        {posts.map((post) => (
                            <div key={post.id}>
                                <Link to={'/project/'+this.props.project_id+'/post/'+post.id} className={'nav-link'+  (parseInt(post.id) === this.state.post_id ? ' actived' : '')} onClick={() => {
                                    this.toggle(post);
                                }} style={{paddingLeft: padding+'em'}}>
                                    {post.children.length <= 0 ?
                                        <Image src={ListPng} />
                                        : <Image src={!post.open ? FolderOpenFill : FolderFill} />
                                    }
                                    <span>{post.name}</span>
                                </Link>
                                {post.children.length > 0 &&
                                    <Collapse in={!post.toggle}>
                                        {this.subMenu(Array.from(post.children), padding + 1.7)}
                                    </Collapse>
                                }
                            </div>
                        ))}
                    </Nav>
                )}
            </div>
        );
    }
    
    render(){
        return this.subMenu(this.props.posts);
    }
    
    componentWillUnmount() {
        this.postIdSubscribe();
    }
}


export default ProjectMenu;