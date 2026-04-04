<?php
 
namespace App\Models;
 
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
 
#[Fillable(['order_id', 'user_id', 'message'])]
class OrderHistory extends Model
{
    use HasFactory, HasUuid;
 
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
 
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
