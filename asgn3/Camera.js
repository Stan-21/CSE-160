class Camera {
    constructor() {
        this.fov = 60;
        this.eye = new Vector3([0,0,-10]);
        this.at = new Vector3([0,0,-1]);
        this.up = new Vector3([0,1,0]);
        // Goes in main function???
        

        this.speed = 1;
    }

    moveForward() {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f = f.normalize();
        this.eye = this.eye.add(f.mul(this.speed));
        this.at = this.at.add(f.mul(this.speed));
        /*this.eye.elements[2] -= 0.5;
        this.at.elements[2] -= 0.5;*/
    }

    moveBackward() {
        var f = new Vector3();
        f.set(this.eye);
        f.sub(this.at);
        f = f.normalize();
        this.eye = this.eye.add(f.mul(this.speed));
        this.at = this.at.add(f.mul(this.speed));
        /*this.eye.elements[2] += 0.5;
        this.at.elements[2] += 0.5;*/

    }

    moveLeft() {
        var f = new Vector3();
        f.set(this.eye);
        f.sub(this.at);
        f = f.normalize();
        var s = Vector3.cross(f,this.up);
        s = s.normalize();
        this.at = this.at.add(s);
        this.eye = this.eye.add(s);
        /*this.eye.elements[0] -= 0.5;
        this.at.elements[0] -= 0.5;*/
    }

    moveRight() {
        var f = new Vector3();
        f.set(this.eye);
        f.sub(this.at);
        f = f.normalize();
        var s = Vector3.cross(this.up,f);
        s = s.normalize();
        this.at = this.at.add(s);
        this.eye = this.eye.add(s);
        /*this.eye.elements[0] += 0.5;
        this.at.elements[0] += 0.5;*/
    }

    panLeft() {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        var perp = Vector3.cross(this.up, f);
        perp.normalize();

        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(5, ...this.up.elements);
        //rotationMatrix.setRotate(5, ...perp.elements);
        f = rotationMatrix.multiplyVector3(f);
        f.add(this.eye);
        this.at = f;
    }

    panRight() {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        var perp = Vector3.cross(this.up, f);
        perp.normalize();

        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-5, ...this.up.elements);
        //rotationMatrix.setRotate(0, ...perp.elements);
        f = rotationMatrix.multiplyVector3(f);
        f.add(this.eye);
        this.at = f;
    }

    panUp() {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        var perp = Vector3.cross(this.up, f);
        perp.normalize();

        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-5, ...perp.elements);
        f = rotationMatrix.multiplyVector3(f);
        f.add(this.eye);
        this.at = f;
    }
    
    panDown() {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        var perp = Vector3.cross(this.up, f);
        perp.normalize();

        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(5, ...perp.elements);
        f = rotationMatrix.multiplyVector3(f);
        f.add(this.eye);
        this.at = f;
    }
}