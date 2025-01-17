<?php


namespace App\Http\Controllers\Api;


use App\Models\Post;
use App\Models\PostComment;
use App\Models\PostEvent;
use App\Models\PostHistory;
use App\Models\Project;
use App\Models\ProjectPermission;
use App\Models\ProjectTop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

class IndexController extends BaseController
{
    /**
     * 主页，展示文档项目列表
     * @param Request $request
     * @return mixed
     */
    public function index(Request $request){
        $uid = Auth::guard('api')->id();
        $list = Project::as('p')->selectRaw('p.*')
            ->leftJoinSub(ProjectPermission::select('id', 'user_id', 'project_id'), 'pp', function($join) use ($uid){
                $join->on('pp.project_id', '=', 'p.id')->where('pp.user_id', '=', $uid);
            })
            ->leftJoinSub(ProjectTop::select('updated_at', 'user_id', 'project_id'), 'pt', function($join) use ($uid){
                $join->on('pt.project_id', '=', 'p.id')->where('pt.user_id', '=', $uid);
            })
            // 所属人是自己，或是开放项目
            ->where(function($query) use ($uid){
                $query->where(['p.user_id' => $uid])->orWhere(['p.type' => 0]);
            })
            // 有权限的
            ->orWhere(function($query){
                $query->whereNotNull('pp.id');
            })
            ->latest('pt.updated_at')
            ->latest('p.id')
            ->with(['tags'])
            ->get()->each(function($v) use ($uid){
                $v->share = $v->user_id == $uid ? false : true;
            });
    
        return $this->success($list);
    }
    
    /**
     * 项目基本信息
     * @param int $id
     * @return array
     */
    public function project(int $id){
        $uid = Auth::guard('api')->id();
        $project = Project::find($id);
        if($project){
            $project->admin = $project->user_id == $uid;
            $project->read = $project->admin || $project->type == 0;
            $project->write = $project->admin;
            // 权限
            $permission = ProjectPermission::where(['project_id' => $project->id, 'user_id' => $uid])->first();
            if($permission){
                $project->read = true;
                if($permission->write){
                    $project->write = true;
                }
                if($permission->admin){
                    $project->admin = true;
                }
            }
        }
        return $this->success($project);
    }
    
    /**
     * 项目下文档递归结构
     * @param int $id
     * @return mixed
     */
    public function posts(int $id){
        $Post = new Post();
        $posts = $Post->children($id, 0, 'id, pid, user_id, name');
        return $this->success($posts);
    }
    
    /**
     * 项目日志
     * @param int $id
     * @return mixed
     */
    public function events(int $id){
        $events = PostEvent::where(['project_id' => $id])->with(['user', 'post'])->latest()->limit(100)->get()->each->parse();
        return $this->success($events);
    }
    
    /**
     * 文档内容
     * @param int $id
     * @return Post
     */
    public function post(int $id){
        $Post = Post::active()->with(['attachments', 'likesGroup'])->withCount(['histories', 'comments'])->where('id', $id)->firstOrFail();
        $Post->comments->each->parent;
        // 不用更新 updated_at， 设置为 false
        $Post->timestamps = false;
        $Post->views += 1;
        $Post->save();
        return $this->success($Post);
    }
    
    /**
     * 评论列表
     * @param int $id
     * @return mixed
     */
    public function comments(int $id){
        $Comments = PostComment::where('post_id', $id)->with(['user', 'likeEmojis'])->latest()->get();
        return $this->success($Comments);
    }
    
    /**
     * markdown 单独上传配置
     * @param Request $request
     * @return array
     */
    public function upload_md(Request $request){
        $allFile = $request->allFiles();
        $files = [];
        collect($allFile)->each(function($v,$k) use ($request,&$files){
            $path = $v->store('files');
            $files[$k] = \Illuminate\Support\Facades\Storage::url($path);
        });
        return [
            'success'   => 1,
            'message'   => 'OK',
            'url'       => array_shift($files)
        ];
    }
    
    /**
     * 首页自定义置顶，只影响当前登录用户
     *  每次都会更新 updated_at，使用此字段倒序
     * @param Request $request
     * @return array
     */
    public function top(Request $request){
        $project_id = $request->input('id');
        $user_id = Auth::id();
        ProjectTop::updateOrCreate(['user_id' => $user_id, 'project_id' => $project_id], ['updated_at' => now()]);
        return $this->success();
    }
}
