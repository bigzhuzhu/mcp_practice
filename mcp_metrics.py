from pydantic import BaseModel, validator, Field
from typing import List, Optional
import re

class ResourceRequest(BaseModel):
    """资源请求验证模型"""
    
    path: str = Field(..., min_length=1, max_length=1000)
    filters: Optional[List[str]] = Field(default=None, max_items=10)
    limit: int = Field(default=100, ge=1, le=1000)
    
    @validator('path')
    def validate_path(cls, v):
        """路径安全验证"""
        # 防止路径遍历
        if '..' in v or v.startswith('/'):
            raise ValueError('不安全的路径')
            
        # 只允许特定字符
        if not re.match(r'^[a-zA-Z0-9/_.-]+$', v):
            raise ValueError('路径包含非法字符')
            
        return v
    
    @validator('filters')
    def validate_filters(cls, v):
        """过滤器验证"""
        if v is None:
            return v
            
        for filter_item in v:
            if len(filter_item) > 100:
                raise ValueError('过滤器过长')
                
        return v

class SecureInputHandler:
    """安全输入处理器"""
    
    def __init__(self):
        # __init__ 方法是类的构造函数，在创建类的实例时会被调用。这里我们初始化了一个 HTMLSanitizer 实例，用于后续的输入清理工作。
        # 为什么不在函数参数中直接传入 sanitizer？因为我们希望在类内部统一管理这个 sanitizer 实例，确保所有输入清理都使用同一个实例来保持一致性和效率。
        # 在函数参数中传入参数并且初始化，和不在函数参数中传入参数直接在 __init__ 中初始化，主要区别在于灵活性和封装性。
        # 将 sanitizer 作为类的属性，可以让我们在类的其他方法中方便地访问和使用它，而不需要每次调用方法时都传入这个参数。这种设计更符合面向对象编程的原则，使得代码更清晰、更易维护。
        self.sanitizer = HTMLSanitizer()
        
    def sanitize_string(self, value: str) -> str:
        """字符串清理"""
        # 移除潜在的恶意内容
        value = self.sanitizer.clean(value)
        
        # 限制长度
        if len(value) > 10000:
            raise ValueError('输入过长')
            
        return value
        
    def validate_file_path(self, path: str) -> str:
        """文件路径验证"""
        # 规范化路径
        normalized = os.path.normpath(path)
        
        # 检查是否在允许的目录内
        if not self._is_within_allowed_dirs(normalized):
            raise PermissionError('访问被拒绝')
            
        return normalized
    
    
    

    
    