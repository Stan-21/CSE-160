class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();

        this.textureNum = -2;

        this.buffer = null;
        this.vertices = null;
        this.uv = null;

        this.cubeVert = new Float32Array([
            0,0,0, 1,1,0, 1,0,0,
            0,0,0, 0,1,0, 1,1,0,
            0.0,1.0,0.0,  0.0,1.0,1.0,  1.0,1.0,1.0,
            0.0,1.0,0.0,  1.0,1.0,1.0,  1.0,1.0,0.0,
            0.0,0.0,0.0,  0.0,0.0,1.0,  1.0,0.0,1.0,
            0.0,0.0,0.0,  1.0,0.0,1.0,  1.0,0.0,0.0,
            1.0,0.0,0.0,  1.0,1.0,0.0,  1.0,1.0,1.0,
            1.0,0.0,0.0,  1.0,0.0,1.0,  1.0,1.0,1.0,
            0.0,0.0,1.0,  0.0,1.0,1.0,  1.0,1.0,1.0,
            0.0,0.0,1.0,  1.0,1.0,1.0,  1.0,0.0,1.0,
            0.0,0.0,0.0,  0.0,1.0,0.0,  0.0,1.0,1.0,
            0.0,0.0,0.0,  0.0,1.0,1.0,  0.0,0.0,1.0
        ])

        this.UV = new Float32Array([
            0,0, 1,1, 1,0,
            0,0, 0,1, 1,1,
            1,0, 1,1, 0,1,
            1,0, 0,1, 0,0,
            1,0, 1,1, 0,1,
            1,0, 0,1, 0,0,
            0,0, 0,1, 1,1,
            0,0, 1,0, 1,1,
            0,0, 0,1, 1,1,
            0,0, 1,1, 1,0,
            0,0, 0,1, 1,1,
            0,0, 1,1, 1,0
        ]);
    }

    generateVertices() {
        let v = [];
        v.push(0,0,0, 1,1,0, 1,0,0); // BACK (POV BACK)
        v.push(0,0,0, 0,1,0, 1,1,0);
        v.push(0.0,1.0,0.0,  0.0,1.0,1.0,  1.0,1.0,1.0); // TOP
        v.push(0.0,1.0,0.0,  1.0,1.0,1.0,  1.0,1.0,0.0);
        v.push(0.0,0.0,0.0,  0.0,0.0,1.0,  1.0,0.0,1.0); // BOTTOM
        v.push(0.0,0.0,0.0,  1.0,0.0,1.0,  1.0,0.0,0.0);

        v.push(1.0,0.0,0.0,  1.0,1.0,0.0,  1.0,1.0,1.0); // RIGHT (POV BACK)
        v.push(1.0,0.0,0.0,  1.0,0.0,1.0,  1.0,1.0,1.0);
        v.push(0.0,0.0,1.0,  0.0,1.0,1.0,  1.0,1.0,1.0); // FRONT (POV BACK)
        v.push(0.0,0.0,1.0,  1.0,1.0,1.0,  1.0,0.0,1.0);

        v.push(0.0,0.0,0.0,  0.0,1.0,0.0,  0.0,1.0,1.0); // LEFT (POV BACK)
        v.push(0.0,0.0,0.0,  0.0,1.0,1.0,  0.0,0.0,1.0);


        this.vertices = new Float32Array(v);
    }

    generateUV(){
        let u = [];
        u.push(0,0, 1,1, 1,0); // BACK
        u.push(0,0, 0,1, 1,1);
        u.push(1,0, 1,1, 0,1); // TOP 
        u.push(1,0, 0,1, 0,0);
        u.push(1,0, 1,1, 0,1); // BOTTOM
        u.push(1,0, 0,1, 0,0);

        u.push(0,0, 0,1, 1,1); // RIGHT
        u.push(0,0, 1,0, 1,1);
        u.push(0,0, 0,1, 1,1); // FRONT (POV BACK)
        u.push(0,0, 1,1, 1,0);
        u.push(0,0, 0,1, 1,1); // LEFT
        u.push(0,0, 1,1, 1,0);

        this.uv = new Float32Array(u);
    }

    render() {
        var rgba = this.color;
        
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        /*if (this.vertices === null) {
            this.generateVertices();
        }*/

        /*if (this.uv === null) {
            this.generateUV();
        }*/

        if (this.buffer === null) {
            this.buffer = gl.createBuffer();
        }
      
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      
        gl.bufferData(gl.ARRAY_BUFFER, this.cubeVert, gl.DYNAMIC_DRAW);
      
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.drawArrays(gl.TRIANGLES, 0, 36);

        var uvBuffer = gl.createBuffer();
        if (!uvBuffer) {
          console.log('Failed to create the buffer object');
          return -1;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.UV, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);
      
        gl.drawArrays(gl.TRIANGLES, 0, 36);

   }

}