{posts.map((post) => (
  <div key={post._id} className="bg-white rounded-lg shadow-md p-6 mb-6">
    <div className="flex items-center mb-4">
      <img
        src={post.author.profileImage || '/default-avatar.png'}
        alt={post.author.name}
        className="w-10 h-10 rounded-full mr-3"
      />
      <div>
        <h3 className="font-semibold">{post.author.name}</h3>
        <p className="text-sm text-gray-500">
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
    
    <h2 className="text-xl font-bold mb-2">{post.title}</h2>
    <p className="text-gray-700 mb-4">{post.content}</p>
    
    {post.image && (
      <div className="mb-4">
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL}${post.image}`}
          alt={post.title}
          className="max-h-96 w-full object-cover rounded-lg"
        />
      </div>
    )}
    
    <div className="flex items-center space-x-4 text-gray-500">
      <button
        onClick={() => handleLike(post._id)}
        className={`flex items-center space-x-1 ${
          post.likes?.includes(user?._id) ? 'text-blue-500' : ''
        }`}
      >
        <span>{post.likesCount || 0}</span>
        <span>Me gusta</span>
      </button>
      
      <button
        onClick={() => setSelectedPost(post)}
        className="flex items-center space-x-1"
      >
        <span>{post.commentsCount || 0}</span>
        <span>Comentarios</span>
      </button>
    </div>
  </div>
))} 